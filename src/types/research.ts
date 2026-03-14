export interface ResearchPaper {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  author: string;
  abstract: string;
  keywords: string[];
  category: string;
  tags: string[];
  cover_image?: string;
  content: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  pdfLink?: string;
  institution?: string;
  pdf_url?: string;
}
