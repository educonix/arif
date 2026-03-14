-- Neon bootstrap schema for this project (safe to run multiple times).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  full_name text,
  nickname text,
  tagline text,
  subtag text,
  about_me text,
  about_short_intro text,
  vision_goals text,
  profile_image text,
  footer_profile_image text,
  email text,
  phone text,
  facebook text,
  linkedin text,
  github text,
  x text,
  youtube text,
  whatsapp text,
  motto text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (
  id,
  full_name,
  tagline,
  subtag,
  about_me,
  about_short_intro,
  vision_goals
)
VALUES (
  1,
  'Shahadat Husain Arif',
  'Passionate Learner & Project Creator',
  'I am passionate about learning, creativity, and building meaningful digital projects. I believe in discipline, curiosity, and using ideas to create work that benefits people.',
  'I am a curious and dedicated learner who values knowledge, sincerity, and creativity. I enjoy discovering new ideas, building meaningful projects, and continuously improving my understanding of technology and innovation.',
  'I am also engaged in student activities and organizational work, where I have developed leadership and a strong sense of responsibility toward society. My aim is to grow into a responsible academician and researcher who contributes positively through learning, discipline, and meaningful work.',
  'My goal is to become a dedicated academician and researcher who contributes positively to society through knowledge, creativity, and meaningful work. I want to keep learning, develop my abilities, and build projects that benefit students and people.'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.education_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  institution text,
  group_name text,
  year text,
  result text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  full_description text,
  project_url text,
  cover_image text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  photo_date date,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  cover_image text,
  author text,
  publish_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.research_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  slug text UNIQUE NOT NULL,
  author text,
  authors text,
  abstract text,
  content text NOT NULL DEFAULT '',
  keywords text[] DEFAULT '{}'::text[],
  keywords_text text,
  category text,
  tags text[] DEFAULT '{}'::text[],
  cover_image text,
  pdf_url text,
  youtube_url text,
  institution text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  publish_date date,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  section text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.storage_files (
  bucket text NOT NULL,
  path text NOT NULL,
  content_type text,
  data_base64 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bucket, path)
);
