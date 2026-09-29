export type ShippingSettings = {
  free_shipping_enabled: boolean;
  flat_shipping_rate: number | string;
  free_shipping_min: number | string | null;
} | null;

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
