import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Acesso administrativo não autorizado.");
  return context.supabase;
}

const nullableText = z.string().trim().max(2000).nullable().optional();
const productSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
  short_description: z.string().trim().max(300).default(""), description: z.string().trim().max(8000).default(""),
  price: z.number().min(0), sale_price: z.number().min(0).nullable(), stock: z.number().int().min(0),
  sku: nullableText, weight_grams: z.number().int().min(0).nullable(), category: nullableText, dimensions: nullableText,
  package_width_cm: z.number().positive().nullable(), package_height_cm: z.number().positive().nullable(), package_length_cm: z.number().positive().nullable(),
  shipping_info: z.string().max(2000).default(""), usage_info: z.string().max(4000).default(""),
  min_quantity: z.number().int().min(1).default(1), image_url: nullableText,
  gallery: z.array(z.string().max(2000)).default([]), benefits: z.array(z.string().max(500)).default([]),
  is_active: z.boolean().default(true), sort_order: z.number().int().default(0),
});
const variantSchema = z.object({
  id: z.string().uuid().optional(), product_id: z.string().uuid(), name: z.string().trim().min(1).max(120),
  sku: nullableText, price: z.number().min(0), sale_price: z.number().min(0).nullable(), stock: z.number().int().min(0),
  weight_grams: z.number().int().min(0).nullable(), is_active: z.boolean().default(true), sort_order: z.number().int().default(0),
});
const orderSchema = z.object({
  id: z.string().uuid(), order_status: z.enum(["awaiting_payment", "paid", "preparing", "shipped", "delivered", "cancelled"]),
  tracking_code: nullableText, notes: nullableText,
});
const settingsSchema = z.object({
  id: z.string().uuid(), store_name: z.string().trim().min(2).max(120), store_description: z.string().max(500),
  whatsapp: nullableText, whatsapp_message: z.string().max(500), instagram: nullableText,
  email: z.string().email().nullable().or(z.literal("")), address: nullableText, logo_url: nullableText, favicon_url: nullableText,
  about_title: z.string().max(200), about_text: z.string().max(8000), about_image_url: nullableText,
  flat_shipping_rate: z.number().min(0), free_shipping_enabled: z.boolean(), free_shipping_min: z.number().min(0).nullable(), shipping_origin_zip: z.string().regex(/^\d{8}$/),
  privacy_policy: z.string().max(20000), terms: z.string().max(20000),
});
const contentTables = ["banners", "testimonials", "faqs", "gallery_images", "benefits", "usage_steps", "coupons"] as const;
type ContentTable = (typeof contentTables)[number];
const contentPayload = z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]));

export const getAdminData = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = await requireAdmin(context);
  const results = await Promise.all([
    db.from("products").select("*").order("sort_order"), db.from("product_variants").select("*").order("sort_order"),
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(250),
    db.from("order_items").select("*").order("created_at", { ascending: false }).limit(1000),
    db.from("customers").select("*").order("created_at", { ascending: false }).limit(250),
    db.from("payments").select("*").order("created_at", { ascending: false }).limit(250),
    db.from("banners").select("*").order("sort_order"), db.from("testimonials").select("*").order("sort_order"),
    db.from("faqs").select("*").order("sort_order"), db.from("gallery_images").select("*").order("sort_order"),
    db.from("benefits").select("*").order("sort_order"), db.from("usage_steps").select("*").order("sort_order"),
    db.from("coupons").select("*").order("created_at", { ascending: false }), db.from("store_settings").select("*").limit(1).maybeSingle(),
  ]);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error("Não foi possível carregar o painel.");
  const [products, variants, orders, orderItems, customers, payments, banners, testimonials, faqs, gallery, benefits, usage, coupons, settings] = results;
  return { products: products.data ?? [], variants: variants.data ?? [], orders: orders.data ?? [], orderItems: orderItems.data ?? [], customers: customers.data ?? [], payments: payments.data ?? [], banners: banners.data ?? [], testimonials: testimonials.data ?? [], faqs: faqs.data ?? [], gallery: gallery.data ?? [], benefits: benefits.data ?? [], usageSteps: usage.data ?? [], coupons: coupons.data ?? [], settings: settings.data };
});

export const saveProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => productSchema.parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { id, ...values } = data;
  const payload = { ...values, gallery: values.gallery as Json, benefits: values.benefits as Json };
  const result = id ? await db.from("products").update(payload).eq("id", id).select("*").single() : await db.from("products").insert(payload).select("*").single();
  if (result.error) throw new Error(result.error.message); return result.data;
});
export const deleteProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { error } = await db.from("products").delete().eq("id", data.id); if (error) throw new Error(error.message); return { ok: true };
});
export const saveVariant = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => variantSchema.parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { id, ...values } = data;
  const result = id ? await db.from("product_variants").update(values).eq("id", id).select("*").single() : await db.from("product_variants").insert(values).select("*").single();
  if (result.error) throw new Error(result.error.message); return result.data;
});
export const deleteVariant = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { error } = await db.from("product_variants").delete().eq("id", data.id); if (error) throw new Error(error.message); return { ok: true };
});
export const deleteOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context);
  const payments = await db.from("payments").delete().eq("order_id", data.id);
  if (payments.error) throw new Error(payments.error.message);
  const items = await db.from("order_items").delete().eq("order_id", data.id);
  if (items.error) throw new Error(items.error.message);
  const order = await db.from("orders").delete().eq("id", data.id);
  if (order.error) throw new Error(order.error.message);
  return { ok: true };
});

export const updateOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => orderSchema.parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { id, ...values } = data; const { error } = await db.from("orders").update(values).eq("id", id); if (error) throw new Error(error.message); return { ok: true };
});
export const saveSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => settingsSchema.parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { error } = await db.from("store_settings").update({ ...data, email: data.email || null }).eq("id", data.id); if (error) throw new Error(error.message); return { ok: true };
});
export const saveContent = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ table: z.enum(contentTables), id: z.string().uuid().optional(), values: contentPayload }).parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const table = data.table as ContentTable;
  const result = data.id ? await db.from(table).update(data.values as never).eq("id", data.id) : await db.from(table).insert(data.values as never);
  if (result.error) throw new Error(result.error.message); return { ok: true };
});
export const deleteContent = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ table: z.enum(contentTables), id: z.string().uuid() }).parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const { error } = await db.from(data.table as ContentTable).delete().eq("id", data.id); if (error) throw new Error(error.message); return { ok: true };
});
export const uploadAdminAsset = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ name: z.string().max(180), type: z.string().regex(/^image\//), base64: z.string().max(14_000_000) }).parse(input)).handler(async ({ context, data }) => {
  const db = await requireAdmin(context); const extension = data.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `admin/${context.userId}/${crypto.randomUUID()}.${extension}`; const bytes = Uint8Array.from(atob(data.base64), (char) => char.charCodeAt(0));
  const { error } = await db.storage.from("loja").upload(path, bytes, { contentType: data.type, upsert: false }); if (error) throw new Error(error.message);
  const signed = await db.storage.from("loja").createSignedUrl(path, 60 * 60 * 24 * 365); if (signed.error || !signed.data?.signedUrl) throw new Error("Não foi possível gerar o endereço da imagem.");
  return { path, url: signed.data.signedUrl };
});
