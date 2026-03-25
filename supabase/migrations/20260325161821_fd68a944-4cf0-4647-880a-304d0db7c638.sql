
CREATE TABLE public.position_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id uuid NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.position_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON public.position_cvs FOR ALL TO public USING (true) WITH CHECK (true);
