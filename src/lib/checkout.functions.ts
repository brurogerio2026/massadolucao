import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  shipping: z.object({ id: z.string().min(1).max(40), destinationZip: z.string().regex(/^\d{8}$/) }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

const PUBLIC_ORIGIN = "https://massadolucao.lovable.app";

function requestOrigin() {
  return process.env["PUBLIC_SITE_URL"] ?? PUBLIC_ORIGIN;
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      throw new Error("O pagamento ainda está sendo configurado. Tente novamente em breve.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.customer.zip_code.replace(/\D/g, "") !== data.shipping.destinationZip) {
      throw new Error("O CEP do endereço mudou. Calcule o frete novamente.");
    }

    // 1. Preços e estoque sempre vêm do banco, nunca do navegador.
    const ids = data.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, sale_price, stock, is_active, image_url, weight_grams, package_width_cm, package_height_cm, package_length_cm")
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

    const { quoteShipping } = await import("./shipping.server");
    const quote = await quoteShipping(supabaseAdmin, data.shipping.destinationZip, data.items);
    const selectedShipping = quote.options.find((option) => option.id === data.shipping.id);
    if (!selectedShipping) throw new Error("A opção de frete escolhida não está mais disponível. Calcule novamente.");
    const shipping = selectedShipping.price;

    // 2. Cupom (opcional). O desconto fica registrado no pedido.
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
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        full_name: data.customer.full_name,
        email: data.customer.email,
        phone: data.customer.phone,
        cpf: data.customer.cpf,
      })
      .select("id")
      .single();
    if (customerError || !customer) throw new Error("Não foi possível registrar os dados do cliente.");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: customer.id,
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
        shipping_service_id: selectedShipping.id,
        shipping_service_name: selectedShipping.name,
        shipping_company_name: selectedShipping.company,
        shipping_delivery_days: selectedShipping.deliveryDays,
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

    const { error: orderItemsError } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product_id,
        product_name: l.product_name,
        unit_price: l.unit_price,
        quantity: l.quantity,
        total: l.total,
      })),
    );
    if (orderItemsError) throw new Error("Não foi possível registrar os itens do pedido.");

    // 4. Mercado Pago
    const origin = requestOrigin();

    // O Checkout Pro não possui um campo de desconto monetário separado.
    // Para cupons, distribuímos o desconto proporcionalmente entre os itens,
    // preservando o frete e o total do pedido. Sem cupom, os preços originais são usados.
    let discountRemaining = Math.round(discount * 100);
    const preferenceItems = lines.map((line, index) => {
      const lineCents = Math.round(line.total * 100);
      const applied = index === lines.length - 1
        ? Math.min(discountRemaining, lineCents)
        : Math.min(discountRemaining, lineCents);
      discountRemaining -= applied;
      const adjustedLineCents = lineCents - applied;
      const unitCents = Math.max(0, Math.round(adjustedLineCents / line.quantity));
      return {
        id: line.product_id,
        title: line.product_name,
        quantity: line.quantity,
        unit_price: unitCents / 100,
        currency_id: "BRL",
      };
    });

    // If quantity rounding prevented an exact representation of the coupon,
    // reject instead of charging a value different from the order total.
    const preferenceItemsTotal = preferenceItems.reduce(
      (sum, item) => sum + Math.round(item.unit_price * 100) * item.quantity,
      0,
    );
    const expectedItemsTotal = Math.round((subtotal - discount) * 100);
    if (preferenceItemsTotal !== expectedItemsTotal) {
      throw new Error("O cupom não pode ser aplicado com precisão a este pedido. Remova o cupom e tente novamente.");
    }

    const preferenceBody = {
      items: preferenceItems,
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
        "id, order_number, total, subtotal, shipping, discount, payment_status, order_status, tracking_code, created_at",
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
