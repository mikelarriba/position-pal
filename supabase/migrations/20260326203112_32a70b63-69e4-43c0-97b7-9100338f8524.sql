
-- Add short_id column to positions
ALTER TABLE public.positions ADD COLUMN short_id text UNIQUE;

-- Create function to generate unique 4-char numeric ID
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  new_id text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    new_id := lpad(floor(random() * 10000)::int::text, 4, '0');
    done := NOT EXISTS (SELECT 1 FROM public.positions WHERE short_id = new_id);
  END LOOP;
  NEW.short_id := new_id;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate short_id on insert
CREATE TRIGGER set_position_short_id
  BEFORE INSERT ON public.positions
  FOR EACH ROW
  WHEN (NEW.short_id IS NULL)
  EXECUTE FUNCTION public.generate_short_id();

-- Backfill existing positions with short_ids
DO $$
DECLARE
  pos RECORD;
  new_id text;
  done bool;
BEGIN
  FOR pos IN SELECT id FROM public.positions WHERE short_id IS NULL LOOP
    done := false;
    WHILE NOT done LOOP
      new_id := lpad(floor(random() * 10000)::int::text, 4, '0');
      done := NOT EXISTS (SELECT 1 FROM public.positions WHERE short_id = new_id);
    END LOOP;
    UPDATE public.positions SET short_id = new_id WHERE id = pos.id;
  END LOOP;
END;
$$;

-- Create app_settings table for folder/repo config
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
