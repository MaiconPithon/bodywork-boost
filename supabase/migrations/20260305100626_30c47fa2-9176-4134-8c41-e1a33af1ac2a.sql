
-- Fix user_roles policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "users_read_own_role" ON public.user_roles;
DROP POLICY IF EXISTS "super_admins_manage_roles" ON public.user_roles;

CREATE POLICY "users_read_own_role" ON public.user_roles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "super_admins_manage_roles" ON public.user_roles
  AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix reviews policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "public_read_approved_reviews" ON public.reviews;
DROP POLICY IF EXISTS "public_insert_reviews" ON public.reviews;
DROP POLICY IF EXISTS "admin_select_all_reviews" ON public.reviews;
DROP POLICY IF EXISTS "admin_update_reviews" ON public.reviews;
DROP POLICY IF EXISTS "admin_delete_reviews" ON public.reviews;

CREATE POLICY "public_read_approved_reviews" ON public.reviews
  AS PERMISSIVE FOR SELECT TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "public_insert_reviews" ON public.reviews
  AS PERMISSIVE FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_select_all_reviews" ON public.reviews
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "admin_update_reviews" ON public.reviews
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "admin_delete_reviews" ON public.reviews
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- Fix other tables: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "public_read_gallery" ON public.gallery;
DROP POLICY IF EXISTS "admin_manage_gallery" ON public.gallery;
CREATE POLICY "public_read_gallery" ON public.gallery AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_gallery" ON public.gallery AS PERMISSIVE FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "public_read_services" ON public.services;
DROP POLICY IF EXISTS "admin_manage_services" ON public.services;
CREATE POLICY "public_read_services" ON public.services AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_services" ON public.services AS PERMISSIVE FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "public_read_settings" ON public.settings;
DROP POLICY IF EXISTS "admin_manage_settings" ON public.settings;
CREATE POLICY "public_read_settings" ON public.settings AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_settings" ON public.settings AS PERMISSIVE FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "public_read_testimonials" ON public.whatsapp_testimonials;
DROP POLICY IF EXISTS "admin_manage_testimonials" ON public.whatsapp_testimonials;
CREATE POLICY "public_read_testimonials" ON public.whatsapp_testimonials AS PERMISSIVE FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_manage_testimonials" ON public.whatsapp_testimonials AS PERMISSIVE FOR ALL TO authenticated USING (is_admin(auth.uid()));
