
-- Add new columns to positions
ALTER TABLE public.positions ADD COLUMN description text;
ALTER TABLE public.positions ADD COLUMN salary_min integer;
ALTER TABLE public.positions ADD COLUMN salary_max integer;
ALTER TABLE public.positions ADD COLUMN salary_currency text DEFAULT 'EUR';

-- Create communications table
CREATE TABLE public.position_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id uuid NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  message_type text NOT NULL DEFAULT 'note' CHECK (message_type IN ('note', 'email', 'comment', 'meeting')),
  author text NOT NULL DEFAULT 'Me',
  content text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.position_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON public.position_communications FOR ALL TO public USING (true) WITH CHECK (true);

-- Enable realtime for communications
ALTER PUBLICATION supabase_realtime ADD TABLE public.position_communications;
