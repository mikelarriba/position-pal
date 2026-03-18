
-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  linkedin_url TEXT,
  description TEXT,
  size TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow all access (single user app)
CREATE POLICY "Allow all access" ON public.companies FOR ALL USING (true) WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add company_id to positions
ALTER TABLE public.positions ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Migrate existing positions: create companies from unique company names
INSERT INTO public.companies (name)
SELECT DISTINCT company FROM public.positions WHERE company IS NOT NULL;

-- Link existing positions to their companies
UPDATE public.positions p
SET company_id = c.id
FROM public.companies c
WHERE p.company = c.name;

-- Make company_id NOT NULL after migration
ALTER TABLE public.positions ALTER COLUMN company_id SET NOT NULL;

-- Keep company column for backward compatibility but it's now denormalized
