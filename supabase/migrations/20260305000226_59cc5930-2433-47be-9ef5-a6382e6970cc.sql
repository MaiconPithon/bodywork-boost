
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_cliente text NOT NULL,
  estrelas integer NOT NULL DEFAULT 5,
  comentario text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
ON public.reviews FOR SELECT
USING (is_approved = true);

-- Anyone can insert reviews (public form)
CREATE POLICY "Anyone can insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.reviews FOR ALL
USING (is_admin(auth.uid()));
