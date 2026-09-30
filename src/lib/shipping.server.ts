import type { Database } from "@/integrations/supabase/types";
import type { ShippingOption, ShippingQuoteItem } from "./shipping";

type AdminClient = { from: (table: keyof Database["public"]["Tables"]) => any };
type MelhorEnvioQuote = { id?: number | string; name?: string; price?: string; custom_price?: string; delivery_time?: number; custom_delivery_time?: number; error?: string; company?: { name?: string; picture?: string } };

export async function quoteShipping(db: AdminClient, destinationZip: string, requestedItems: ShippingQuoteItem[]): Promise<{ destinationZip: string; options: ShippingOption[] }> {
  const token = process.env["MELHOR_ENVIO_ACCESS_TOKEN"];
  if (!token) throw new Error("O cálculo de frete está temporariamente indisponível.");
  const cleanZip = destinationZip.replace(/\D/g, "");
  if (cleanZip.length !== 8) throw new Error("Informe um CEP válido com 8 números.");
  const ids = [...new Set(requestedItems.map((item) => item.productId))];
  const { data: products, error: productsError } = await db.from("products").select("id, name, price, sale_price, weight_grams, package_width_cm, package_height_cm, package_length_cm, is_active").in("id", ids);
  if (productsError) throw new Error("Não foi possível carregar os produtos para calcular o frete.");
  const payloadProducts = requestedItems.map((item) => {
    const product = products?.find((row: any) => row.id === item.productId);
    if (!product || !product.is_active) throw new Error("Há um produto indisponível no cálculo.");
    const width = Number(product.package_width_cm); const height = Number(product.package_height_cm); const length = Number(product.package_length_cm); const weight = Number(product.weight_grams) / 1000;
    if (![width, height, length, weight].every((value) => Number.isFinite(value) && value > 0)) throw new Error(`As medidas de envio de “${product.name}” ainda não foram cadastradas.`);
    const salePrice = product.sale_price == null ? 0 : Number(product.sale_price);
    return { id: product.id, width, height, length, weight, insurance_value: Number((salePrice > 0 ? salePrice : Number(product.price)).toFixed(2)), quantity: item.quantity };
  });
  const { data: settings, error: settingsError } = await db.from("store_settings").select("shipping_origin_zip, free_shipping_enabled, free_shipping_min").limit(1).maybeSingle();
  if (settingsError || !settings) throw new Error("O CEP de origem da loja não está configurado.");
  const originZip = String(settings.shipping_origin_zip ?? "").replace(/\D/g, "");
  if (originZip.length !== 8) throw new Error("O CEP de origem da loja não está configurado.");
  const response = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "Massa do Lucao (loja online)" }, body: JSON.stringify({ from: { postal_code: originZip }, to: { postal_code: cleanZip }, products: payloadProducts, options: { receipt: false, own_hand: false } }) });
  const body = await response.text();
  if (!response.ok) { console.error(`Melhor Envio request failed [${response.status}]: ${body}`); throw new Error(response.status === 401 ? "A integração de frete precisa ser reconectada." : "Não foi possível calcular o frete para este CEP."); }
  let quotes: MelhorEnvioQuote[];
  try { quotes = JSON.parse(body) as MelhorEnvioQuote[]; } catch { throw new Error("O Melhor Envio retornou uma resposta inválida."); }
  const subtotal = payloadProducts.reduce((sum, item) => sum + item.insurance_value * item.quantity, 0);
  const freeShipping = Boolean(settings.free_shipping_enabled) || (settings.free_shipping_min != null && Number(settings.free_shipping_min) > 0 && subtotal >= Number(settings.free_shipping_min));
  const options = quotes.filter((quote) => quote.id != null && !quote.error && (quote.custom_price ?? quote.price) != null).map((quote) => ({ id: String(quote.id), name: quote.name ?? "Entrega", company: quote.company?.name ?? "Transportadora", companyPicture: quote.company?.picture ?? null, price: freeShipping ? 0 : Number(quote.custom_price ?? quote.price), deliveryDays: Number(quote.custom_delivery_time ?? quote.delivery_time ?? 0) })).filter((quote) => Number.isFinite(quote.price) && quote.price >= 0).sort((a, b) => a.price - b.price || a.deliveryDays - b.deliveryDays);
  if (options.length === 0) throw new Error("Nenhuma opção de entrega foi encontrada para este CEP.");
  return { destinationZip: cleanZip, options };
}