
-- Create position status enum
CREATE TYPE public.position_status AS ENUM ('bookmarked', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn');

-- Create positions table
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  url TEXT,
  status position_status NOT NULL DEFAULT 'bookmarked',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed - single user app, no auth
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (no auth)
CREATE POLICY "Allow all access" ON public.positions FOR ALL USING (true) WITH CHECK (true);

-- Create CV storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('cv', 'cv', true);

-- Storage policies for CV bucket (open access, single user)
CREATE POLICY "Allow all read on cv" ON storage.objects FOR SELECT USING (bucket_id = 'cv');
CREATE POLICY "Allow all insert on cv" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cv');
CREATE POLICY "Allow all update on cv" ON storage.objects FOR UPDATE USING (bucket_id = 'cv');
CREATE POLICY "Allow all delete on cv" ON storage.objects FOR DELETE USING (bucket_id = 'cv');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
