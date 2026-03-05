
-- Create whatsapp_testimonials table
CREATE TABLE public.whatsapp_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view testimonials
CREATE POLICY "Anyone can read testimonials"
  ON public.whatsapp_testimonials FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage testimonials"
  ON public.whatsapp_testimonials FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create testimonials storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials', 'testimonials', true);

-- Storage policies for testimonials bucket
CREATE POLICY "Anyone can read testimonials files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'testimonials');

CREATE POLICY "Admins can upload testimonials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'testimonials' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete testimonials"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'testimonials' AND public.is_admin(auth.uid()));

-- Fix reviews: admins need DELETE policy explicitly
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (public.is_admin(auth.uid()));
