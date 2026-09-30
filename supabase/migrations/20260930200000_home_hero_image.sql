alter table public.store_settings
  add column if not exists hero_image_url text;

comment on column public.store_settings.hero_image_url is
  'Imagem principal exibida no destaque da home; pode ser alterada pelo administrador.';
