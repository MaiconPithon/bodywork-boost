
-- Fix ALL RLS policies: drop RESTRICTIVE and recreate as PERMISSIVE

-- ===== reviews =====
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

CREATE POLICY "Anyone can read approved reviews" ON public.reviews
  AS PERMISSIVE FOR SELECT TO anon, authenticated USING (is_approved = true);

CREATE POLICY "Anyone can insert reviews" ON public.reviews
  AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can select all reviews" ON public.reviews
  AS PERMISSIVE FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reviews" ON public.reviews
  AS PERMISSIVE FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reviews" ON public.reviews
  AS PERMISSIVE FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- ===== user_roles =====
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can read own role" ON public.user_roles
  AS PERMISSIVE FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  AS PERMISSIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- ===== gallery =====
DROP POLICY IF EXISTS "Anyone can read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;

CREATE POLICY "Anyone can read gallery" ON public.gallery
  AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage gallery" ON public.gallery
  AS PERMISSIVE FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ===== settings =====
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Anyone can read settings" ON public.settings
  AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage settings" ON public.settings
  AS PERMISSIVE FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ===== services =====
DROP POLICY IF EXISTS "Anyone can read active services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

CREATE POLICY "Anyone can read active services" ON public.services
  AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage services" ON public.services
  AS PERMISSIVE FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- ===== whatsapp_testimonials =====
DROP POLICY IF EXISTS "Anyone can read testimonials" ON public.whatsapp_testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.whatsapp_testimonials;

CREATE POLICY "Anyone can read testimonials" ON public.whatsapp_testimonials
  AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage testimonials" ON public.whatsapp_testimonials
  AS PERMISSIVE FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
