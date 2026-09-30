import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { createCheckout } from "@/lib/checkout.functions";
import { ShippingCalculator } from "@/components/site/ShippingCalculator";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Massa do Lucão" },
      { name: "description", content: "Finalize seu pedido da Massa do Lucão com segurança." },
      { property: "og:title", content: "Checkout — Massa do Lucão" },
      { property: "og:description", content: "Finalize seu pedido com pagamento pelo Mercado Pago." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const fields = [
  { name: "full_name", label: "Nome completo", type: "text", required: true },
  { name: "cpf", label: "CPF", type: "text", required: true },
  { name: "email", label: "E-mail", type: "email", required: true },
  { name: "phone", label: "Telefone / WhatsApp", type: "tel", required: true },
  { name: "zip_code", label: "CEP", type: "text", required: true },
  { name: "street", label: "Endereço", type: "text", required: true },
  { name: "number", label: "Número", type: "text", required: true },
  { name: "complement", label: "Complemento", type: "text", required: false },
  { name: "district", label: "Bairro", type: "text", required: true },
  { name: "city", label: "Cidade", type: "text", required: true },
  { name: "state", label: "Estado (UF)", type: "text", required: true },
] as const;

function CheckoutPage() {
  const { items, subtotal, clear, shipping, setShipping } = useCart();
  const shippingItems = items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
  const navigate = useNavigate();
  const submitCheckout = useServerFn(createCheckout);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }
    if (!shipping) { toast.error("Calcule e escolha uma opção de frete."); return; }
    const formData = new FormData(event.currentTarget);
    const customer = Object.fromEntries(
      fields.map((f) => [f.name, String(formData.get(f.name) ?? "").trim()]),
    ) as Record<string, string>;
    customer["state"] = (customer["state"] ?? "").toUpperCase();

    setLoading(true);
    try {
      const result = await submitCheckout({
        data: {
          customer: customer as never,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          couponCode: coupon || null,
          shipping: { id: shipping.id, destinationZip: shipping.destinationZip },
        },
      });
      clear();
      if (result.initPoint) {
        window.location.href = result.initPoint;
        return;
      }
      if (result.warning) toast.info(result.warning);
      void navigate({ to: "/pedido/$orderId", params: { orderId: result.orderId } });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Não foi possível finalizar o pedido agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="grid gap-4 rounded-2xl bg-surface p-5 ring-1 ring-border sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.name} className="text-sm">
                <span className="text-muted-foreground">
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                <input
                  name={f.name}
                  type={f.type}
                  required={f.required}
                  maxLength={160}
                  defaultValue={f.name === "zip_code" ? shipping?.destinationZip ?? "" : ""}
                  className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            ))}
          </div>

          <aside className="h-fit rounded-2xl bg-surface p-5 ring-1 ring-border">
            <h2 className="font-display text-xl uppercase">Resumo do pedido</h2>
            <div className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <div
                  key={`${i.productId}-${i.variantId ?? ""}`}
                  className="flex justify-between text-muted-foreground"
                >
                  <span>
                    {i.quantity}× {i.name}
                  </span>
                  <span>{formatBRL(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <ShippingCalculator items={shippingItems} initialZip={shipping?.destinationZip} selected={shipping} onSelect={setShipping} />
            <label className="mt-4 block text-sm">
              <span className="text-muted-foreground">Cupom de desconto</span>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                maxLength={40}
                className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-sm uppercase ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>{shipping ? `${shipping.company} · ${shipping.price === 0 ? "Grátis" : formatBRL(shipping.price)}` : "Escolha uma opção"}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatBRL(subtotal + (shipping?.price ?? 0))}</span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || items.length === 0 || !shipping}
              className="mt-5 w-full rounded-full py-3"
            >
              {loading ? "Processando…" : "Pagar com Mercado Pago"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Cartão, Pix e demais formas disponíveis na conta do Mercado Pago.
            </p>
          </aside>
        </form>
      </section>
    </SiteLayout>
  );
}
