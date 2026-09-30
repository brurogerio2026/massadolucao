export type ShippingSettings = {
  free_shipping_enabled: boolean;
  flat_shipping_rate: number | string;
  free_shipping_min: number | string | null;
} | null;

export type ShippingQuoteItem = { productId: string; quantity: number };
export type ShippingOption = { id: string; name: string; company: string; companyPicture: string | null; price: number; deliveryDays: number };
export type ShippingSelection = ShippingOption & { destinationZip: string; cartKey: string };
export function shippingCartKey(items: ShippingQuoteItem[]) { return [...items].sort((a, b) => a.productId.localeCompare(b.productId)).map((item) => `${item.productId}:${item.quantity}`).join("|"); }

/** Regras de frete configuráveis no painel: frete grátis geral,
 *  frete grátis acima de um valor mínimo, ou frete fixo. */
export function calcShipping(subtotal: number, settings: ShippingSettings): number {
  if (!settings) return 0;
  if (settings.free_shipping_enabled) return 0;
  const min = settings.free_shipping_min == null ? null : Number(settings.free_shipping_min);
  if (min != null && min > 0 && subtotal >= min) return 0;
  const flat = Number(settings.flat_shipping_rate ?? 0);
  return Number.isFinite(flat) ? flat : 0;
}
