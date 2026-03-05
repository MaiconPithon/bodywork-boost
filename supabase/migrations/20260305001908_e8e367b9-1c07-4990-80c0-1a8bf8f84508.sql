
-- Fix reviews: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;

CREATE POLICY "Anyone can read approved reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (is_approved = true);

CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix user_roles: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Fix gallery
DROP POLICY IF EXISTS "Anyone can read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;

CREATE POLICY "Anyone can read gallery" ON public.gallery
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery" ON public.gallery
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix settings
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix services
DROP POLICY IF EXISTS "Anyone can read active services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

CREATE POLICY "Anyone can read active services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Fix whatsapp_testimonials
DROP POLICY IF EXISTS "Anyone can read testimonials" ON public.whatsapp_testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.whatsapp_testimonials;

CREATE POLICY "Anyone can read testimonials" ON public.whatsapp_testimonials
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage testimonials" ON public.whatsapp_testimonials
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
