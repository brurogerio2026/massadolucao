-- roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- store settings (single row)
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Massa do Lucão',
  store_description text NOT NULL DEFAULT 'Massa especial para a pesca de tilápias.',
  logo_url text,
  favicon_url text,
  whatsapp text,
  whatsapp_message text NOT NULL DEFAULT 'Olá! Vim pelo site da Massa do Lucão e gostaria de saber mais sobre os produtos.',
  instagram text,
  email text,
  address text,
  about_title text NOT NULL DEFAULT 'Conheça a Massa do Lucão',
  about_text text NOT NULL DEFAULT '',
  about_image_url text,
  privacy_policy text NOT NULL DEFAULT '',
  terms text NOT NULL DEFAULT '',
  free_shipping_enabled boolean NOT NULL DEFAULT false,
  flat_shipping_rate numeric(10,2) NOT NULL DEFAULT 0,
  free_shipping_min numeric(10,2),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_settings BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  stock integer NOT NULL DEFAULT 0,
  sku text,
  weight_grams integer,
  dimensions text,
  category text,
  image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  usage_info text NOT NULL DEFAULT '',
  shipping_info text NOT NULL DEFAULT '',
  min_quantity integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  stock integer NOT NULL DEFAULT 0,
  sku text,
  weight_grams integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "variants admin write" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- editable content tables
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  message text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON public.testimonials FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "gallery admin write" ON public.gallery_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  mobile_image_url text,
  button_label text,
  button_link text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners public read" ON public.banners FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "banners admin write" ON public.banners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.usage_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.usage_steps TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.usage_steps TO authenticated;
GRANT ALL ON public.usage_steps TO service_role;
ALTER TABLE public.usage_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "steps public read" ON public.usage_steps FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "steps admin write" ON public.usage_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.benefits TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.benefits TO authenticated;
GRANT ALL ON public.benefits TO service_role;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "benefits public read" ON public.benefits FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "benefits admin write" ON public.benefits FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- coupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric(5,2),
  discount_amount numeric(10,2),
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons admin" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- customers and orders
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  cpf text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers admin" ON public.customers FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TYPE public.payment_status AS ENUM ('pending','approved','rejected','cancelled','refunded');
CREATE TYPE public.order_status AS ENUM ('awaiting_payment','paid','preparing','shipped','delivered','cancelled');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number bigint GENERATED BY DEFAULT AS IDENTITY,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_cpf text,
  zip_code text,
  street text,
  number text,
  complement text,
  district text,
  city text,
  state text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  payment_method text,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  order_status public.order_status NOT NULL DEFAULT 'awaiting_payment',
  mp_preference_id text,
  mp_payment_id text,
  tracking_code text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders admin" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items admin" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'mercadopago',
  provider_payment_id text,
  status text,
  amount numeric(10,2),
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments admin" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- demo content
INSERT INTO public.store_settings (whatsapp, instagram, email, about_text)
VALUES ('5511999999999','massadolucao','contato@massadolucao.com.br','Conteúdo de demonstração — edite este texto no painel administrativo em Configurações.');

INSERT INTO public.products (slug, name, short_description, description, price, sale_price, stock, sku, weight_grams, category, min_quantity, sort_order)
VALUES ('massa-do-lucao','Massa do Lucão','Massa especial para a pesca de tilápias.','Conteúdo de demonstração — edite a descrição completa no painel administrativo.',29.90,NULL,50,'MDL-001',300,'Massa de pesca',1,1);

INSERT INTO public.benefits (title, description, icon, sort_order) VALUES
('Especial para tilápias','Conteúdo de demonstração — edite no painel.','fish',1),
('Fácil de usar','Conteúdo de demonstração — edite no painel.','droplet',2),
('Feito à mão','Conteúdo de demonstração — edite no painel.','leaf',3),
('Envio para todo o Brasil','Conteúdo de demonstração — edite no painel.','package',4);

INSERT INTO public.usage_steps (title, description, sort_order) VALUES
('Prepare a massa','Conteúdo de demonstração — edite no painel.',1),
('Ajuste a consistência','Conteúdo de demonstração — edite no painel.',2),
('Faça a isca','Conteúdo de demonstração — edite no painel.',3),
('Prenda no anzol','Conteúdo de demonstração — edite no painel.',4),
('Prepare-se para a pescaria','Conteúdo de demonstração — edite no painel.',5);

INSERT INTO public.testimonials (name, message, rating, location, sort_order) VALUES
('Rafael','Depoimento de demonstração — edite ou remova no painel.',5,'MG',1),
('Juliana','Depoimento de demonstração — edite ou remova no painel.',5,'SP',2),
('Diego','Depoimento de demonstração — edite ou remova no painel.',5,'PR',3);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('Para qual peixe a Massa do Lucão é indicada?','Resposta de demonstração — edite no painel administrativo.',1),
('Como utilizar?','Resposta de demonstração — edite no painel administrativo.',2),
('Como faço meu pedido?','Resposta de demonstração — edite no painel administrativo.',3),
('Quais formas de pagamento?','Resposta de demonstração — edite no painel administrativo.',4),
('Qual o prazo de envio?','Resposta de demonstração — edite no painel administrativo.',5),
('Vocês enviam para todo o Brasil?','Resposta de demonstração — edite no painel administrativo.',6);