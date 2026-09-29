import { createServerFn, getRequest } from "@tanstack/react-start";
import { z } from "zod";
import { calcShipping } from "./shipping";

const checkoutSchema = z.object({
  customer: z.object({
    full_name: z.string().min(3).max(120),
    cpf: z.string().min(11).max(14),
    email: z.string().email().max(160),
    phone: z.string().min(8).max(20),
    zip_code: z.string().min(8).max(9),
    street: z.string().min(2).max(160),
    number: z.string().min(1).max(20),
    complement: z.string().max(120).optional().default(""),
    district: z.string().min(2).max(120),
    city: z.string().min(2).max(120),
    state: z.string().min(2).max(2),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(30),
  couponCode: z.string().max(40).optional().nullable(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

function requestOrigin() {
  const req = getRequest();
  const url = new URL(req.url);
  const forwarded = url.hostname === "localhost" ? req.headers.get("x-forwarded-host") : null;
  return forwarded ? `https://${forwarded}` : url.origin;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Preços e estoque sempre vêm do banco, nunca do navegador.
    const ids = data.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, sale_price, stock, is_active, image_url")
      .in("id", ids);
    if (productsError) throw new Error("Não foi possível carregar os produtos.");

    const lines = data.items.map((item) => {
      const product = products?.find((p) => p.id === item.productId);
      if (!product || !product.is_active) throw new Error("Produto indisponível no carrinho.");
      if (product.stock < item.quantity)
        throw new Error(`Estoque insuficiente para ${product.name}.`);
      const sale = product.sale_price == null ? null : Number(product.sale_price);
      const unit = sale && sale > 0 ? sale : Number(product.price);
      return {
        product_id: product.id,
        product_name: product.name,
        unit_price: unit,
        quantity: item.quantity,
        total: Number((unit * item.quantity).toFixed(2)),
        image_url: product.image_url,
      };
    });

    const subtotal = Number(lines.reduce((s, l) => s + l.total, 0).toFixed(2));

    const { data: settings } = await supabaseAdmin
      .from("store_settings")
      .select("free_shipping_enabled, flat_shipping_rate, free_shipping_min")
      .limit(1)
      .maybeSingle();
    const shipping = calcShipping(subtotal, settings ?? null);

    // 2. Cupom (opcional)
    let discount = 0;
    let couponCode: string | null = null;
    const rawCoupon = data.couponCode?.trim().toUpperCase();
    if (rawCoupon) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", rawCoupon)
        .eq("is_active", true)
        .maybeSingle();
      const now = new Date();
      const valid =
        coupon &&
        subtotal >= Number(coupon.min_order_amount ?? 0) &&
        (!coupon.starts_at || new Date(coupon.starts_at) <= now) &&
        (!coupon.expires_at || new Date(coupon.expires_at) >= now) &&
        (coupon.usage_limit == null || coupon.used_count < coupon.usage_limit);
      if (valid && coupon) {
        couponCode = coupon.code;
        discount = coupon.discount_percent
          ? Number(((subtotal * Number(coupon.discount_percent)) / 100).toFixed(2))
          : Number(coupon.discount_amount ?? 0);
        discount = Math.min(discount, subtotal);
      }
    }

    const total = Number((subtotal + shipping - discount).toFixed(2));

    // 3. Cliente + pedido
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .insert({
        full_name: data.customer.full_name,
        email: data.customer.email,
        phone: data.customer.phone,
        cpf: data.customer.cpf,
      })
      .select("id")
      .single();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customer?.id ?? null,
        customer_name: data.customer.full_name,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
        customer_cpf: data.customer.cpf,
        zip_code: data.customer.zip_code,
        street: data.customer.street,
        number: data.customer.number,
        complement: data.customer.complement,
        district: data.customer.district,
        city: data.customer.city,
        state: data.customer.state,
        subtotal,
        shipping,
        discount,
        total,
        coupon_code: couponCode,
        payment_method: "mercadopago",
        payment_status: "pending",
        order_status: "awaiting_payment",
      })
      .select("id, order_number")
      .single();
    if (orderError || !order) throw new Error("Não foi possível registrar o pedido.");

    await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product_id,
        product_name: l.product_name,
        unit_price: l.unit_price,
        quantity: l.quantity,
        total: l.total,
      })),
    );

    // 4. Mercado Pago
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      return {
        orderId: order.id as string,
        orderNumber: order.order_number as number,
        initPoint: null as string | null,
        warning:
          "O pagamento pelo Mercado Pago ainda não está configurado. O pedido foi registrado e a loja entrará em contato.",
      };
    }

    const origin = requestOrigin();
    const preferenceBody = {
      items: lines.map((l) => ({
        id: l.product_id,
        title: l.product_name,
        quantity: l.quantity,
        unit_price: l.unit_price,
        currency_id: "BRL",
      })),
      payer: {
        name: data.customer.full_name,
        email: data.customer.email,
        identification: { type: "CPF", number: data.customer.cpf.replace(/\D+/g, "") },
      },
      shipments: { cost: shipping, mode: "not_specified" },
      external_reference: order.id,
      back_urls: {
        success: `${origin}/pedido/${order.id}`,
        pending: `${origin}/pedido/${order.id}`,
        failure: `${origin}/pedido/${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/public/mercadopago/webhook`,
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!response.ok) {
      console.error("Mercado Pago preference error", response.status, await response.text());
      return {
        orderId: order.id as string,
        orderNumber: order.order_number as number,
        initPoint: null as string | null,
        warning:
          "Não conseguimos abrir o pagamento agora. Seu pedido foi registrado e a loja entrará em contato.",
      };
    }

    const preference = (await response.json()) as {
      id: string;
      init_point?: string;
      sandbox_init_point?: string;
    };

    await supabaseAdmin
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("id", order.id);

    return {
      orderId: order.id as string,
      orderNumber: order.order_number as number,
      initPoint: (preference.init_point ?? preference.sandbox_init_point ?? null) as string | null,
      warning: null as string | null,
    };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, total, subtotal, shipping, discount, payment_status, order_status, tracking_code, created_at, customer_name",
      )
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) return null;
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_name, quantity, unit_price, total")
      .eq("order_id", data.orderId);
    return { order, items: items ?? [] };
  });
