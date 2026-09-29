import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

type MpPayment = {
  id: number | string;
  status?: string;
  transaction_amount?: number;
  external_reference?: string | null;
  payment_method_id?: string | null;
};

function mapStatus(status: string | undefined) {
  switch (status) {
    case "approved":
      return { payment_status: "approved" as const, order_status: "paid" as const };
    case "rejected":
      return { payment_status: "rejected" as const, order_status: "awaiting_payment" as const };
    case "cancelled":
ədə      return { payment_status: "cancelled" as const, order_status: "cancelled" as const };
    case "refunded":
    case "charged_back":
      return { payment_status: "refunded" as const, order_status: "cancelled" as const };
    default:
      return { payment_status: "pending" as const, order_status: "awaiting_payment" as const };
  }
}

/** Valida a assinatura x-signature do Mercado Pago quando o segredo está configurado. */
function signatureValid(request: Request, dataId: string): boolean {
  const secret = process.env["MERCADOPAGO_WEBHOOK_SECRET"];
  if (!secret) return true; // segredo opcional: sem ele, o pagamento ainda é reconsultado na API
  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string]),
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/mercadopago/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!accessToken) return new Response("not configured", { status: 200 });

        let body: { type?: string; action?: string; data?: { id?: string } } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("invalid body", { status: 400 });
        }

        const paymentId = body.data?.id;
        const type = body.type ?? body.action?.split(".")[0];
        if (!paymentId || type !== "payment") return new Response("ignored", { status: 200 });
        if (!signatureValid(request, String(paymentId)))
          return new Response("invalid signature", { status: 401 });

        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!mpResponse.ok) return new Response("payment lookup failed", { status: 202 });
        const payment = (await mpResponse.json()) as MpPayment;
        const orderId = payment.external_reference;
        if (!orderId) return new Response("no reference", { status: 200 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const mapped = mapStatus(payment.status);

        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: mapped.payment_status,
            order_status: mapped.order_status,
            mp_payment_id: String(payment.id),
            payment_method: payment.payment_method_id ?? "mercadopago",
          })
          .eq("id", orderId);

        await supabaseAdmin.from("payments").insert({
          order_id: orderId,
          provider: "mercadopago",
          provider_payment_id: String(payment.id),
          status: payment.status ?? null,
          amount: payment.transaction_amount ?? null,
          raw: payment as unknown as Record<string, unknown>,
        });

        // Baixa de estoque somente na aprovação.
        if (payment.status === "approved") {
          const { data: items } = await supabaseAdmin
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId);
          for (const item of items ?? []) {
            if (!item.product_id) continue;
            const { data: product } = await supabaseAdmin
              .from("products")
              .select("stock")
              .eq("id", item.product_id)
              .maybeSingle();
            if (product) {
              await supabaseAdmin
                .from("products")
                .update({ stock: Math.max(0, product.stock - item.quantity) })
                .eq("id", item.product_id);
            }
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
