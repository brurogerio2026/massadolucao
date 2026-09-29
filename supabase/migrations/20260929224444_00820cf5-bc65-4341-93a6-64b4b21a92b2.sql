ALTER TABLE public.store_settings
  ADD COLUMN shipping_origin_zip text NOT NULL DEFAULT '13772018';

ALTER TABLE public.products
  ADD COLUMN package_width_cm numeric(8,2) NOT NULL DEFAULT 11,
  ADD COLUMN package_height_cm numeric(8,2) NOT NULL DEFAULT 2,
  ADD COLUMN package_length_cm numeric(8,2) NOT NULL DEFAULT 16;

ALTER TABLE public.orders
  ADD COLUMN shipping_service_id text,
  ADD COLUMN shipping_service_name text,
  ADD COLUMN shipping_company_name text,
  ADD COLUMN shipping_delivery_days integer;

COMMENT ON COLUMN public.store_settings.shipping_origin_zip IS 'CEP de origem usado para cotação de frete';
COMMENT ON COLUMN public.products.package_width_cm IS 'Largura da embalagem em centímetros';
COMMENT ON COLUMN public.products.package_height_cm IS 'Altura da embalagem em centímetros';
COMMENT ON COLUMN public.products.package_length_cm IS 'Comprimento da embalagem em centímetros';