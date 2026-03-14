-- Run this in your Supabase SQL Editor to create the research_papers table

CREATE TABLE IF NOT EXISTS public.research_papers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  slug text NOT NULL UNIQUE,
  author text NOT NULL,
  abstract text NOT NULL,
  keywords text[] DEFAULT '{}'::text[],
  category text,
  tags text[] DEFAULT '{}'::text[],
  cover_image text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published papers
CREATE POLICY "Allow public read access for published papers" 
  ON public.research_papers 
  FOR SELECT 
  USING (status = 'published');

-- Allow authenticated users (admin) to do everything
CREATE POLICY "Allow authenticated users full access" 
  ON public.research_papers 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);
