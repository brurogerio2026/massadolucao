DROP POLICY "products public read" ON public.products;
CREATE POLICY "products anon read" ON public.products FOR SELECT TO anon USING (is_active);
CREATE POLICY "products auth read" ON public.products FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "variants public read" ON public.product_variants;
CREATE POLICY "variants anon read" ON public.product_variants FOR SELECT TO anon USING (is_active);
CREATE POLICY "variants auth read" ON public.product_variants FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "testimonials public read" ON public.testimonials;
CREATE POLICY "testimonials anon read" ON public.testimonials FOR SELECT TO anon USING (is_active);
CREATE POLICY "testimonials auth read" ON public.testimonials FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "faqs public read" ON public.faqs;
CREATE POLICY "faqs anon read" ON public.faqs FOR SELECT TO anon USING (is_active);
CREATE POLICY "faqs auth read" ON public.faqs FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "gallery public read" ON public.gallery_images;
CREATE POLICY "gallery anon read" ON public.gallery_images FOR SELECT TO anon USING (is_active);
CREATE POLICY "gallery auth read" ON public.gallery_images FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "banners public read" ON public.banners;
CREATE POLICY "banners anon read" ON public.banners FOR SELECT TO anon USING (is_active);
CREATE POLICY "banners auth read" ON public.banners FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "steps public read" ON public.usage_steps;
CREATE POLICY "steps anon read" ON public.usage_steps FOR SELECT TO anon USING (is_active);
CREATE POLICY "steps auth read" ON public.usage_steps FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "benefits public read" ON public.benefits;
CREATE POLICY "benefits anon read" ON public.benefits FOR SELECT TO anon USING (is_active);
CREATE POLICY "benefits auth read" ON public.benefits FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "settings public read" ON public.store_settings;
CREATE POLICY "settings anon read" ON public.store_settings FOR SELECT TO anon USING (true);
CREATE POLICY "settings auth read" ON public.store_settings FOR SELECT TO authenticated USING (true);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO authenticated;