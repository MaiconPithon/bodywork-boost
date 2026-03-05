
-- =============================================
-- NUCLEAR FIX: Drop ALL existing policies and recreate as PERMISSIVE
-- =============================================

-- reviews
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can read approved reviews " ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews " ON public.reviews;
DROP POLICY IF EXISTS "Admins can select all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can select all reviews " ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews " ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete reviews " ON public.reviews;

CREATE POLICY "public_read_approved_reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "public_insert_reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_select_all_reviews" ON public.reviews FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin_update_reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admin_delete_reviews" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role " ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles " ON public.user_roles;

CREATE POLICY "users_read_own_role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "super_admins_manage_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- gallery
DROP POLICY IF EXISTS "Anyone can read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can read gallery " ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admins can manage gallery " ON public.gallery;

CREATE POLICY "public_read_gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "admin_manage_gallery" ON public.gallery FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- services
DROP POLICY IF EXISTS "Anyone can read active services" ON public.services;
DROP POLICY IF EXISTS "Anyone can read active services " ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services " ON public.services;

CREATE POLICY "public_read_services" ON public.services FOR SELECT USING (true);
CREATE POLICY "admin_manage_services" ON public.services FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- settings
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
DROP POLICY IF EXISTS "Anyone can read settings " ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings " ON public.settings;

CREATE POLICY "public_read_settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "admin_manage_settings" ON public.settings FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- whatsapp_testimonials
DROP POLICY IF EXISTS "Anyone can read testimonials" ON public.whatsapp_testimonials;
DROP POLICY IF EXISTS "Anyone can read testimonials " ON public.whatsapp_testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.whatsapp_testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials " ON public.whatsapp_testimonials;

CREATE POLICY "public_read_testimonials" ON public.whatsapp_testimonials FOR SELECT USING (true);
CREATE POLICY "admin_manage_testimonials" ON public.whatsapp_testimonials FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
