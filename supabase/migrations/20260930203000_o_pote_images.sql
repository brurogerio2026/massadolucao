alter table public.store_settings
  add column if not exists pot_section_image_1_url text,
  add column if not exists pot_section_image_2_url text;

comment on column public.store_settings.pot_section_image_1_url is
  'Primeira imagem exibida na seção O pote da home.';

comment on column public.store_settings.pot_section_image_2_url is
  'Segunda imagem exibida na seção O pote da home.';
