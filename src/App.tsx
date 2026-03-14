/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, ChevronRight, ChevronLeft, BookOpen, FileText, ExternalLink, 
  Mail, Facebook, Linkedin, Github, Twitter, Youtube, 
  MessageSquare, Users, Clock, Zap, Lightbulb, ShieldCheck, 
  Target, Presentation, GraduationCap, Award, Book, Phone, MessageCircle, Copy, Check, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useSliderAutoPlay } from './hooks/useSliderAutoPlay';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ResearchPaperView } from './components/ResearchPaperView';
import { CopyLinkButton } from './components/CopyLinkButton';
import { PdfButton } from './components/PdfButton';
import { ResearchPaper } from './types/research';

import 'katex/dist/katex.min.css';
import katex from 'katex';

// --- Types ---
interface NavItem {
  label: string;
  href: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  group: string;
  year: string;
  result: string;
}

interface SkillItem {
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface ProjectItem {
  title: string;
  description: string;
  fullDescription?: string;
  image: string;
  link: string;
}

interface ResearchItem {
  title: string;
  subtitle?: string;
  published: string;
  content: string;
  summary: string;
  link: string;
  abstract?: string;
  keywords?: string[];
  journal?: string;
  pdfLink?: string;
}

interface BlogPost {
  title: string;
  link: string;
  summary: string;
  content: string;
  image: string;
  published: string;
}

interface GalleryItem {
  id: string;
  image: string;
  caption: string;
  date: string;
}

// --- Constants ---
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Education', href: '#education' },
  { label: 'Research Papers', href: '#research' },
  { label: 'Goals', href: '#goals' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blogs', href: '#blog' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

const EDUCATION: EducationItem[] = [
  {
    degree: 'Dakhil',
    institution: 'Kakonhat Fazil Degree Madrasah',
    group: 'Science',
    year: '2023',
    result: 'GPA 5.00',
  },
  {
    degree: 'Alim',
    institution: 'Rajshahi Darus Salam Kamil Madrasah',
    group: 'Science',
    year: '2025',
    result: 'GPA 5.00',
  },
  {
    degree: 'Current Study',
    institution: 'Mawlana Bhashani Science & Technology University (MBSTU)',
    group: 'Mathematics',
    year: 'Ongoing',
    result: 'Pursuing Excellence',
  },
];

const SKILLS: SkillItem[] = [
  { name: 'Communication', icon: <MessageSquare className="w-6 h-6" />, description: 'Articulating ideas clearly and effectively.' },
  { name: 'Leadership', icon: <Users className="w-6 h-6" />, description: 'Guiding teams towards a common goal.' },
  { name: 'Time Management', icon: <Clock className="w-6 h-6" />, description: 'Optimizing productivity and meeting deadlines.' },
  { name: 'Quick Learning', icon: <Zap className="w-6 h-6" />, description: 'Rapidly acquiring and applying new knowledge.' },
  { name: 'Creativity', icon: <Lightbulb className="w-6 h-6" />, description: 'Thinking outside the box for innovative solutions.' },
  { name: 'Problem Solving', icon: <ShieldCheck className="w-6 h-6" />, description: 'Analyzing challenges and finding practical answers.' },
  { name: 'Discipline', icon: <Target className="w-6 h-6" />, description: 'Maintaining focus and consistency in all endeavors.' },
  { name: 'Presentation Skill', icon: <Presentation className="w-6 h-6" />, description: 'Delivering engaging and impactful presentations.' },
];

const PROJECTS: ProjectItem[] = [
  {
    title: 'BoiCloud',
    description: 'An online Bengali book library where users can read and download books easily. Designed for accessibility and simplicity.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
    link: 'https://boicloud.2bd.net',
  },
];

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    caption: 'University Tech Symposium',
    date: '2025-11-15',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    caption: 'Hackathon Winners Ceremony',
    date: '2025-10-22',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
    caption: 'Project Presentation Day',
    date: '2025-09-10',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    caption: 'Annual Science Fair',
    date: '2025-08-05',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    caption: 'Team Building Workshop',
    date: '2025-07-18',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    caption: 'Research Seminar',
    date: '2025-06-30',
  },
];

// --- Components ---

const ResearchArticle = ({ article }: { article: ResearchItem }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!contentRef.current) return;

    // 1. Process Headings for TOC
    const headings = contentRef.current.querySelectorAll('h2, h3');
    const tocItems: { id: string; text: string; level: number }[] = [];
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      tocItems.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.substring(1))
      });
    });
    setToc(tocItems);

    // 2. Process Equations
    const content = contentRef.current;
    
    // Block equations: $$ ... $$
    const blockRegex = /\$\$(.*?)\$\$/gs;
    let blockCount = 1;
    content.innerHTML = content.innerHTML.replace(blockRegex, (_, tex) => {
      try {
        const rendered = katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
        return `<div class="equation-wrapper">
                  <div class="equation-content">${rendered}</div>
                  <div class="equation-number">(${blockCount++})</div>
                </div>`;
      } catch (e) {
        return `<div class="equation-error">${tex}</div>`;
      }
    });

    // Inline equations: \( ... \), $ ... $, or ( ... ) if it looks like math
    const inlineRegex = /\\\((.*?)\\\)|\$(.*?)\$|\(([^)]*?[\^\\_=][^)]*?)\)/g;
    content.innerHTML = content.innerHTML.replace(inlineRegex, (_, tex1, tex2, tex3) => {
      const tex = tex1 || tex2 || tex3;
      if (!tex) return _;
      try {
        return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return tex;
      }
    });

    // 3. Process Academic Blocks
    // We look for specific patterns like [Theorem], [Definition], etc.
    const blockTypes = ['Theorem', 'Definition', 'Lemma', 'Proof', 'Corollary', 'Proposition'];
    blockTypes.forEach(type => {
      const regex = new RegExp(`\\[${type}\\](.*?)\\[\\/${type}\\]`, 'gs');
      content.innerHTML = content.innerHTML.replace(regex, (_, inner) => {
        return `<div class="academic-block academic-${type.toLowerCase()}">
                  <div class="academic-label">${type}</div>
                  <div class="academic-content">${inner}</div>
                </div>`;
      });
    });

    // 4. Process Figures
    const images = content.querySelectorAll('img');
    images.forEach(img => {
      const parent = img.parentElement;
      if (parent && parent.tagName === 'P') {
        const figure = document.createElement('figure');
        figure.className = 'academic-figure';
        
        const imgClone = img.cloneNode(true) as HTMLImageElement;
        figure.appendChild(imgClone);
        
        // Try to find caption (often the next text or a specific format)
        const nextNode = img.nextSibling as CharacterData | null;
        if (nextNode && nextNode.nodeType === Node.TEXT_NODE && (nextNode.textContent || '').trim().startsWith('Figure:')) {
          const caption = document.createElement('figcaption');
          caption.textContent = (nextNode.textContent || '').trim();
          figure.appendChild(caption);
          nextNode.textContent = ''; // Clear the original text
        }
        
        parent.replaceChild(figure, img);
      }
    });

    // 5. Process References
    const refHeading = Array.from(content.querySelectorAll('h2, h3')).find((h: any) => (h.textContent || '').toLowerCase().includes('reference')) as HTMLElement | undefined;
    if (refHeading) {
      let next = refHeading.nextElementSibling as HTMLElement | null;
      while (next && next.tagName !== 'H2' && next.tagName !== 'H3') {
        if (next.tagName === 'UL' || next.tagName === 'OL') {
          next.classList.add('academic-references');
        }
        next = next.nextElementSibling as HTMLElement | null;
      }
    }

    // 6. Intersection Observer for TOC highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0% -80% 0%' }
    );

    headings.forEach((heading) => observer.observe(heading));

    // 7. Convert "Click for PDF" links to buttons
    const links = contentRef.current.querySelectorAll('a');
    links.forEach(link => {
      if (link.textContent?.includes('Click for PDF')) {
        const url = link.getAttribute('href');
        if (url) {
          const button = document.createElement('button');
          button.className = 'px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-all';
          button.textContent = 'View PDF';
          button.onclick = () => window.open(url, '_blank');
          link.replaceWith(button);
        }
      }
    });

    return () => observer.disconnect();
  }, [article.content]);

  return (
    <div className="research-article-container grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
      {/* Sidebar TOC */}
      <aside className="hidden lg:block sticky top-32 self-start max-h-[calc(100vh-200px)] overflow-y-auto pr-4 scrollbar-hide">
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Table of Contents</h4>
          <nav className="space-y-1">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-sm py-2 transition-all border-l-2 pl-4 ${
                  activeId === item.id 
                    ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200'
                } ${item.level === 3 ? 'ml-4 text-xs' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <article className="max-w-3xl mx-auto w-full">
        <header className="mb-12 border-b border-slate-100 pb-12">
          <div className="flex items-center gap-3 text-emerald-700 font-bold uppercase tracking-widest text-xs mb-6">
            <Book className="w-4 h-4" />
            <span>Research Article</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl text-slate-500 mb-8 font-medium italic leading-relaxed">
              {article.subtitle}
            </p>
          )}
          {article.abstract && (
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3">Abstract</h3>
              <p className="text-slate-700 leading-relaxed">{article.abstract}</p>
            </div>
          )}
          {article.keywords && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.keywords.map(k => <span key={k} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{k}</span>)}
            </div>
          )}
          {article.pdfLink && (
            <div className="mb-8 flex items-center gap-4">
              <PdfButton url={article.pdfLink} />
              <CopyLinkButton url={window.location.href} />
            </div>
          )}
          
          <div className="bg-slate-900 text-white p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Cite this paper</h4>
              <p className="text-xs font-mono text-slate-300">
                Shahadat Husain Arif – {article.title} – {new Date(article.published).getFullYear()}
              </p>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(`Shahadat Husain Arif – ${article.title} – ${new Date(article.published).getFullYear()}`)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-all shrink-0"
            >
              Copy
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold text-slate-900">Shahadat Husain Arif</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.published}</span>
            </div>
          </div>
        </header>

        {/* Mobile TOC */}
        <div className="lg:hidden mb-12">
          <details className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group">
            <summary className="p-5 font-bold text-slate-900 cursor-pointer flex justify-between items-center list-none">
              <span>Table of Contents</span>
              <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
            </summary>
            <nav className="p-5 pt-0 space-y-3 border-t border-slate-100">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-sm ${item.level === 3 ? 'ml-4 text-slate-500' : 'font-medium text-slate-700'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    (e.currentTarget.closest('details') as HTMLDetailsElement).open = false;
                  }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </details>
        </div>

        <div 
          ref={contentRef}
          className="academic-content prose prose-lg prose-emerald max-w-none text-slate-800 leading-[1.8] font-serif"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="mt-20 pt-12 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400 italic mb-8">
            Published by Shahadat Husain Arif &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </article>
    </div>
  );
};

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="text-center mb-12 md:mb-16">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight"
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-emerald-700 font-bold uppercase tracking-widest text-xs md:text-sm"
      >
        {subtitle}
      </motion.p>
    )}
    <motion.div 
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="h-1 w-20 bg-emerald-600 mx-auto mt-6 rounded-full"
    />
  </div>
);

const THEME_STORAGE_KEY = 'preferred-theme';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ResearchItem | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [researchPosts, setResearchPosts] = useState<ResearchItem[]>([]);
  const [academicPapers, setAcademicPapers] = useState<ResearchPaper[]>([]);
  const [selectedAcademicPaper, setSelectedAcademicPaper] = useState<ResearchPaper | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllResearch, setShowAllResearch] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<GalleryItem | null>(null);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loadingEducation, setLoadingEducation] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [loadingResearch, setLoadingResearch] = useState(true);

  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [blogIndex, setBlogIndex] = useState(0);
  const [researchIndex, setResearchIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const researchSliderRef = useRef<HTMLDivElement>(null);
  const projectSliderRef = useRef<HTMLDivElement>(null);

  const { 
    handleInteractionStart: handleBlogInteractionStart, 
    handleInteractionEnd: handleBlogInteractionEnd 
  } = useSliderAutoPlay(sliderRef, blogPosts.length, loadingBlog, showAllPosts || !!selectedBlogPost);

  const { 
    handleInteractionStart: handleResearchInteractionStart, 
    handleInteractionEnd: handleResearchInteractionEnd 
  } = useSliderAutoPlay(researchSliderRef, researchPosts.length, loadingResearch, showAllResearch || !!selectedResearch);

  const { 
    handleInteractionStart: handleProjectInteractionStart, 
    handleInteractionEnd: handleProjectInteractionEnd 
  } = useSliderAutoPlay(projectSliderRef, projects.length, loadingProjects, showAllProjects || !!selectedProject);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const shouldUseDarkMode = storedTheme === 'dark';

    setIsDarkMode(shouldUseDarkMode);
    document.documentElement.classList.toggle('dark-mode', shouldUseDarkMode);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Fetch blog and research posts from Blogger
  useEffect(() => {
    const fetchSiteContent = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) throw new Error(`Site settings request failed: ${response.status}`);
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSiteContent(data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    const fetchEducation = async () => {
      try {
        const response = await fetch('/api/education');
        if (!response.ok) throw new Error(`Education request failed: ${response.status}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setEducation(data.map((item: any) => ({
            degree: item.title,
            institution: item.institution,
            group: item.group_name,
            year: item.year,
            result: item.result
          })));
        } else {
          setEducation(EDUCATION);
        }
      } catch (error) {
        console.error('Error fetching education:', error);
        setEducation(EDUCATION);
      } finally {
        setLoadingEducation(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error(`Projects request failed: ${response.status}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setProjects(data.map((item: any) => ({
            title: item.title,
            description: item.short_description,
            fullDescription: item.full_description,
            image: item.cover_image,
            link: item.project_url
          })));
        } else {
          setProjects(PROJECTS);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(PROJECTS);
      } finally {
        setLoadingProjects(false);
      }
    };

    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) throw new Error(`Gallery request failed: ${response.status}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setGallery(data.map((item: any) => ({
            id: item.id,
            image: item.image_url,
            caption: item.caption,
            date: item.photo_date
          })));
        } else {
          setGallery(GALLERY_ITEMS);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setGallery(GALLERY_ITEMS);
      } finally {
        setLoadingGallery(false);
      }
    };

    const fetchAcademicPapers = async () => {
      try {
        const response = await fetch('/api/research-papers');
        if (!response.ok) throw new Error(`Research papers request failed: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setAcademicPapers(data);
        }
      } catch (error) {
        console.error('Error fetching research papers:', error);
      }
    };

    fetchSiteContent();
    fetchEducation();
    fetchProjects();
    fetchGallery();
    fetchAcademicPapers();

    const fetchData = async () => {
      try {
        // Fetch Blog Posts
        const blogResponse = await fetch('/api/blog');
        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          const blogEntries = blogData.feed?.entry || [];
          
          const posts: BlogPost[] = blogEntries.map((entry: any) => {
            try {
              // Check if it has "Research" label
              const categories = entry.category || [];
              const isResearch = categories.some((cat: any) => cat.term === 'Research');
              if (isResearch) return null;

              const title = entry.title.$t;
              const link = entry.link.find((l: any) => l.rel === 'alternate')?.href || '#';
              const fullContent = entry.content?.$t || entry.summary?.$t || '';
              const summary = entry.summary?.$t || entry.content?.$t || '';
              const cleanSummary = summary.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
              
              let image = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800';
              if (entry.media$thumbnail) {
                image = entry.media$thumbnail.url.replace('s72-c', 's1600');
              } else {
                const imgMatch = fullContent.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) image = imgMatch[1];
              }

              return {
                title,
                link,
                summary: cleanSummary,
                content: fullContent,
                image,
                published: new Date(entry.published.$t).toLocaleDateString()
              };
            } catch (e) {
              return null;
            }
          }).filter((post: any) => post !== null);
          setBlogPosts(posts);
        }

        // Fetch Research Posts
        const researchResponse = await fetch('/api/research');
        if (researchResponse.ok) {
          const researchData = await researchResponse.json();
          const researchEntries = researchData.feed?.entry || [];
          
          const research: ResearchItem[] = researchEntries.map((entry: any) => {
            try {
              const title = entry.title.$t;
              const link = entry.link.find((l: any) => l.rel === 'alternate')?.href || '#';
              const content = entry.content?.$t || entry.summary?.$t || '';
              const summary = (entry.summary?.$t || entry.content?.$t || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
              
              // Try to find subtitle (often in the first few lines or a specific tag)
              const subtitleMatch = content.match(/<h[23][^>]*>(.*?)<\/h[23]>/);
              const subtitle = subtitleMatch ? subtitleMatch[1].replace(/<[^>]*>?/gm, '') : undefined;

              const parser = new DOMParser();
              const doc = parser.parseFromString(content, 'text/html');

              const getSection = (headingText: string) => {
                const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
                const heading = headings.find(h => h.textContent?.toLowerCase().includes(headingText.toLowerCase()));
                if (!heading) return undefined;
                
                let next = heading.nextElementSibling;
                let text = '';
                while (next && !['H2', 'H3', 'H4'].includes(next.tagName)) {
                  text += next.textContent + ' ';
                  next = next.nextElementSibling;
                }
                return text.trim();
              };

              const abstract = getSection('Abstract');
              const keywordsText = getSection('Keywords');
              const keywords = keywordsText ? keywordsText.split(',').map(k => k.trim()) : undefined;
              const journal = getSection('Journal');
              
              const pdfLinkEl = Array.from(doc.querySelectorAll('a')).find(a => 
                a.textContent?.toLowerCase().includes('pdf') || 
                a.getAttribute('href')?.includes('drive.google.com')
              );
              const pdfLink = pdfLinkEl?.getAttribute('href') || undefined;

              return {
                title,
                subtitle,
                published: new Date(entry.published.$t).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                content,
                summary,
                link,
                abstract,
                keywords,
                journal,
                pdfLink
              };
            } catch (e) {
              return null;
            }
          }).filter((item: any) => item !== null);
          setResearchPosts(research);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingBlog(false);
        setLoadingResearch(false);
      }
    };

    fetchData();
  }, []);

  const scrollSlider = (direction: 'left' | 'right', type: 'blog' | 'research' | 'projects' = 'blog') => {
    const ref = type === 'blog' ? sliderRef : type === 'research' ? researchSliderRef : projectSliderRef;
    if (ref.current) {
      if (type === 'blog') {
        handleBlogInteractionStart();
        handleBlogInteractionEnd();
      } else if (type === 'research') {
        handleResearchInteractionStart();
        handleResearchInteractionEnd();
      } else {
        handleProjectInteractionStart();
        handleProjectInteractionEnd();
      }
      const scrollAmount = ref.current.offsetWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const updateSliderIndex = (type: 'blog' | 'research' | 'projects') => {
    const ref = type === 'blog' ? sliderRef : type === 'research' ? researchSliderRef : projectSliderRef;
    if (ref.current) {
      const scrollLeft = ref.current.scrollLeft;
      const itemWidth = ref.current.querySelector('div')?.offsetWidth || 400;
      const index = Math.round(scrollLeft / (itemWidth + 24)); // 24 is gap-6
      if (type === 'blog') setBlogIndex(index);
      else if (type === 'research') setResearchIndex(index);
      else setProjectIndex(index);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDarkMode = () => setIsDarkMode((previous) => !previous);
  const getContent = (key: string, fallback: string) => siteContent[key] || fallback;

  const renderName = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length <= 1) return name;
    
    const lastName = parts.pop();
    const firstName = parts.join(" ");
    
    return (
      <>
        {firstName} <span className="text-emerald-600">{lastName}</span>
      </>
    );
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('https://formspree.io/f/meergnbb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setFormStatus('success');
        (e.target as HTMLFormElement).reset();
        // Reset success message after 5 seconds
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 5000);
      }
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const sortedGalleryItems = [...gallery].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- Navbar --- */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#home" className="flex items-center group">
            <span className={`text-2xl font-display font-black tracking-widest transition-colors ${
              scrolled ? 'text-emerald-700' : 'text-emerald-700'
            }`}>
              ARIF
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-500 ${
                  scrolled ? 'text-slate-600' : 'text-slate-700'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`theme-toggle-button ${isDarkMode ? 'is-dark' : ''}`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-icon" aria-hidden="true">
                {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
              </span>
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMenu}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {NAV_ITEMS.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-medium text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- Hero Section --- */}
      <section id="home" className="relative min-h-[70vh] md:min-h-screen w-full flex items-center pt-24 pb-12 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/40 -skew-x-12 translate-x-1/4 z-0 hidden lg:block" />
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-8xl font-display font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                {renderName(siteContent.full_name || "Shahadat Husain Arif")}
              </h1>
              <p className="text-2xl md:text-3xl text-slate-700 mb-6 font-medium tracking-normal">
                {siteContent.tagline || "Passionate Learner & Project Creator"}
              </p>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl font-normal leading-relaxed">
                {siteContent.subtag || "I am passionate about learning, creativity, and building meaningful digital projects. I believe in discipline, curiosity, and using ideas to create work that benefits people."}
              </p>
              <div className="flex flex-col sm:items-start gap-3">
                <a 
                  href="#about" 
                  className="px-10 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-center transition-all shadow-xl shadow-emerald-900/20 hover:scale-105 active:scale-95"
                >
                  Explore Me
                </a>
                <p className="text-sm text-slate-500 font-medium text-center sm:text-left w-full sm:w-auto sm:px-2">
                  Start discovering my journey
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-full overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img 
                  src={getContent('profile_image', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800')} 
                  alt="Arif Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-100/50 rounded-[3rem] -z-0" />
              <div className="absolute -top-6 -left-6 w-32 h-32 border-4 border-emerald-200 rounded-[3rem] -z-0" />
            </motion.div>
 
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-4 block">About Me</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-8 tracking-tight">
                {renderName(getContent('full_name', 'Shahadat Husain Arif'))}
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed mb-8 font-medium">
                {getContent('about_me', 'I am a curious and dedicated learner who values knowledge, sincerity, and creativity. I enjoy discovering new ideas, building meaningful projects, and continuously improving my understanding of technology and innovation.')}
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-10">
                {getContent('about_short_intro', 'I am also engaged in student activities and organizational work, where I have developed leadership and a strong sense of responsibility toward society. My aim is to grow into a responsible academician and researcher who contributes positively through learning, discipline, and meaningful work.')}
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Experience</p>
                    <p className="text-slate-950 font-bold text-lg">Project Creator</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100">
                    <Book className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Focus</p>
                    <p className="text-slate-950 font-bold text-lg">Knowledge, Technology & Problem Solving</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Education Section --- */}
      <section id="education" className="py-24 md:py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <SectionTitle subtitle="My Journey">Education</SectionTitle>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {education.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm z-10 absolute left-0 md:left-1/2 md:-translate-x-1/2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 ml-16 md:ml-0">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display font-bold text-2xl text-slate-900 tracking-tight">{item.degree}</h3>
                    <span className="text-xs font-bold px-3 py-1.5 bg-emerald-100/50 text-emerald-700 rounded-full">{item.year}</span>
                  </div>
                  <p className="text-emerald-700 font-medium text-lg mb-6">{item.institution}</p>
                  <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Group</p>
                      <p className="text-sm font-semibold text-slate-800">{item.group}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Result</p>
                      <p className="text-sm font-semibold text-slate-800">{item.result}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --- Academic Papers Section --- */}
      {academicPapers.length > 0 && (
        <section id="academic-papers" className="py-24 md:py-32 px-6 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <SectionTitle subtitle="Publications">Academic Papers</SectionTitle>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center -mt-8">
                My latest published research and academic papers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {academicPapers.map((paper) => (
                <div 
                  key={paper.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
                  onClick={() => setSelectedAcademicPaper(paper)}
                >
                  {paper.cover_image && (
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={paper.cover_image} 
                        alt={paper.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold tracking-widest uppercase mb-4">
                      <span>{new Date(paper.published_at || paper.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {paper.title}
                    </h3>
                    <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed">
                      {paper.abstract}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.keywords && paper.keywords.map(k => <span key={k} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{k}</span>)}
                    </div>
                    {paper.institution && <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">{paper.institution}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedAcademicPaper(paper)}
                        className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-3 transition-all"
                      >
                        Read Paper <ChevronRight className="w-4 h-4" />
                      </button>
                      {paper.pdf_url && <PdfButton url={paper.pdf_url} />}
                      <CopyLinkButton url={`${window.location.origin}/research/${paper.slug}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Research Section --- */}
      <section id="research" className="py-24 md:py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <SectionTitle subtitle="Academic Insights">Research Papers</SectionTitle>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center -mt-8">
              Exploring the foundations of logical reasoning and its application in problem-solving.
            </p>
          </div>
          
          {loadingResearch ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
            </div>
          ) : researchPosts.length > 0 ? (
            <>
              <div 
                ref={researchSliderRef}
                onMouseEnter={handleResearchInteractionStart}
                onMouseLeave={handleResearchInteractionEnd}
                onTouchStart={handleResearchInteractionStart}
                onTouchEnd={handleResearchInteractionEnd}
                onFocus={handleResearchInteractionStart}
                onBlur={handleResearchInteractionEnd}
                onScroll={() => {
                  updateSliderIndex('research');
                  handleResearchInteractionStart();
                  handleResearchInteractionEnd();
                }}
                className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {researchPosts.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                    whileHover={{ 
                      y: -12, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeInOut" }
                    }}
                    className="relative min-w-[300px] md:min-w-[400px] p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all group snap-start cursor-pointer"
                  >
                    {idx === 0 && (
                      <div className="absolute top-6 right-6 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-10">
                        Featured
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-4 tracking-tight line-clamp-2">{item.title}</h3>
                    <div className="flex flex-col gap-4 mb-8">
                      {item.abstract && <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{item.abstract}</p>}
                      {item.keywords && (
                        <div className="flex flex-wrap gap-2">
                          {item.keywords.map(k => <span key={k} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-md">{k}</span>)}
                        </div>
                      )}
                      {item.journal && <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.journal}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-auto gap-4">
                      <button 
                        onClick={() => setSelectedResearch(item)}
                        className="text-emerald-700 font-bold flex items-center gap-2 hover:gap-3 transition-all"
                      >
                        Read More <ChevronRight className="w-4 h-4" />
                      </button>
                      <CopyLinkButton url={item.link} />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-4 mb-8">
                {researchPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const itemWidth = researchSliderRef.current?.querySelector('div')?.offsetWidth || 400;
                      researchSliderRef.current?.scrollTo({ left: idx * (itemWidth + 24), behavior: 'smooth' });
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      researchIndex === idx ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8">
                <button 
                  onClick={() => scrollSlider('left', 'research')}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => scrollSlider('right', 'research')}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setShowAllResearch(true)}
                  className="ml-4 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10"
                >
                  See All
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300">
              <p className="text-xl font-medium mb-2">No research articles found</p>
              <p className="text-sm">Check back later for new academic insights.</p>
            </div>
          )}
        </div>

        {/* Research Detail Modal */}
        <AnimatePresence>
          {selectedResearch && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white overflow-y-auto"
            >
              <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <button 
                  onClick={() => setSelectedResearch(null)}
                  className="fixed top-6 right-6 z-[110] p-3 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ResearchArticle article={selectedResearch} />

                  <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-100">
                    <button 
                      onClick={() => setSelectedResearch(null)}
                      className="px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all"
                    >
                      Back to Portfolio
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- Goals Section --- */}
      <section id="goals" className="py-24 md:py-32 px-6 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Target className="w-16 h-16 text-emerald-400 mx-auto mb-8 cursor-pointer" onDoubleClick={() => setIsLoginModalOpen(true)} />
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">My Vision & Goals</h2>
            <p className="text-xl md:text-2xl text-emerald-100/80 leading-relaxed font-light italic">
              "{getContent('vision_goals', 'My goal is to become a dedicated academician and researcher who contributes positively to society through knowledge, creativity, and meaningful work. I want to keep learning, develop my abilities, and build projects that benefit students and people.')}"
            </p>
            <div className="mt-12 flex justify-center gap-4">
              <div className="h-1 w-12 bg-emerald-400 rounded-full" />
              <div className="h-1 w-4 bg-emerald-400/30 rounded-full" />
              <div className="h-1 w-4 bg-emerald-400/30 rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Skills Section --- */}
      <section id="skills" className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="My Strengths">Skills & Abilities</SectionTitle>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {SKILLS.map((skill, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="p-10 rounded-[2.5rem] bg-white border border-slate-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 shadow-sm flex items-center justify-center text-emerald-700 mb-8 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300">
                  {skill.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-950 mb-4 tracking-tight">{skill.name}</h3>
                <p className="text-slate-600 text-base leading-relaxed">{skill.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Projects Section --- */}
      <section id="projects" className="py-20 md:py-32 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="Featured Work">My Projects</SectionTitle>
          
          <div 
            ref={projectSliderRef}
            onMouseEnter={handleProjectInteractionStart}
            onMouseLeave={handleProjectInteractionEnd}
            onTouchStart={handleProjectInteractionStart}
            onTouchEnd={handleProjectInteractionEnd}
            onFocus={handleProjectInteractionStart}
            onBlur={handleProjectInteractionEnd}
            onScroll={() => {
              updateSliderIndex('projects');
              handleProjectInteractionStart();
              handleProjectInteractionEnd();
            }}
            className={`flex gap-6 pb-12 ${projects.length > 1 ? 'overflow-x-auto scrollbar-hide snap-x snap-mandatory' : 'justify-center'}`}
            style={projects.length > 1 ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {projects.map((project, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-500 shrink-0 ${projects.length > 1 ? 'w-[calc(100vw-3rem)] md:w-[800px] snap-center' : 'w-full max-w-4xl'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="aspect-video md:aspect-auto overflow-hidden relative">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-slate-950 mb-4">{project.title}</h3>
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">{project.description}</p>
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold transition-all self-start"
                    >
                      View Project <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {projects.length > 1 ? (
            <>
              <div className="flex justify-center gap-2 mt-4 mb-8">
                {projects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const itemWidth = projectSliderRef.current?.querySelector('div')?.offsetWidth || 800;
                      projectSliderRef.current?.scrollTo({ left: idx * (itemWidth + 24), behavior: 'smooth' });
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      projectIndex === idx ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8">
                <button 
                  onClick={() => scrollSlider('left', 'projects')}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => scrollSlider('right', 'projects')}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setShowAllProjects(true)}
                  className="ml-4 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10"
                >
                  See All
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center mt-8">
              <button 
                onClick={() => setShowAllProjects(true)}
                className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10"
              >
                See All
              </button>
            </div>
          )}
        </div>

        {/* Project Detail Modal/Overlay */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-video lg:aspect-auto h-full overflow-hidden">
                    <img 
                      src={selectedProject.image} 
                      alt={selectedProject.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8 md:p-16 flex flex-col justify-center">
                    <span className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-4 block">Project Details</span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 tracking-tight">{selectedProject.title}</h2>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                      {selectedProject.fullDescription || selectedProject.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a 
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                      >
                        Visit Website <ExternalLink className="w-5 h-5" />
                      </a>
                      <button 
                        onClick={() => setSelectedProject(null)}
                        className="px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* --- All Projects View --- */}
      <AnimatePresence>
        {showAllProjects && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-white overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4">All Projects</h2>
                  <p className="text-lg text-slate-600">A complete showcase of my featured work and applications.</p>
                </div>
                <button 
                  onClick={() => setShowAllProjects(false)}
                  className="p-4 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 group hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col"
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-xl font-display font-bold text-slate-950 mb-4 group-hover:text-emerald-700 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-600 mb-8 line-clamp-3 text-sm leading-relaxed flex-grow">
                        {project.description}
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setShowAllProjects(false);
                        }}
                        className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-3 transition-all mt-auto"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-20 text-center">
                <button 
                  onClick={() => setShowAllProjects(false)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl"
                >
                  Close Projects
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- All Research Papers View --- */}
      <AnimatePresence>
        {showAllResearch && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-white overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4">Research Papers</h2>
                  <p className="text-lg text-slate-600">A comprehensive collection of my academic research and notes.</p>
                </div>
                <button 
                  onClick={() => setShowAllResearch(false)}
                  className="p-4 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchPosts.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl transition-all group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-700 mb-6 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-4 tracking-tight line-clamp-2">{item.title}</h3>
                    <p className="text-slate-600 mb-8 leading-relaxed line-clamp-3">{item.summary}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <button 
                        onClick={() => {
                          setSelectedResearch(item);
                          setShowAllResearch(false);
                        }}
                        className="text-emerald-700 font-bold flex items-center gap-2 hover:gap-3 transition-all"
                      >
                        Read More <ChevronRight className="w-4 h-4" />
                      </button>
                      <CopyLinkButton url={item.link} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Blog Section --- */}
      <section id="blog" className="py-24 md:py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <SectionTitle subtitle="Latest Articles">My Blog</SectionTitle>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center -mt-8">
              A collection of my latest articles, ideas, and useful writings.
            </p>
          </div>

          {loadingBlog ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
            </div>
          ) : blogPosts.length > 0 ? (
            <>
              <div 
                ref={sliderRef}
                onMouseEnter={handleBlogInteractionStart}
                onMouseLeave={handleBlogInteractionEnd}
                onTouchStart={handleBlogInteractionStart}
                onTouchEnd={handleBlogInteractionEnd}
                onFocus={handleBlogInteractionStart}
                onBlur={handleBlogInteractionEnd}
                onScroll={() => {
                  updateSliderIndex('blog');
                  handleBlogInteractionStart();
                  handleBlogInteractionEnd();
                }}
                className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {blogPosts.map((post, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                    whileHover={{ 
                      y: -12, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeInOut" }
                    }}
                    className="min-w-[300px] md:min-w-[400px] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 snap-start group hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                        {post.published}
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl md:text-2xl font-display font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                      <button 
                        onClick={() => setSelectedBlogPost(post)}
                        className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-3 transition-all"
                      >
                        Read More <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-center gap-2 mt-4 mb-8">
                {blogPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const itemWidth = sliderRef.current?.querySelector('div')?.offsetWidth || 400;
                      sliderRef.current?.scrollTo({ left: idx * (itemWidth + 24), behavior: 'smooth' });
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      blogIndex === idx ? 'w-8 bg-emerald-600' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8">
                <button 
                  onClick={() => scrollSlider('left')}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => scrollSlider('right')}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all shadow-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setShowAllPosts(true)}
                  className="ml-4 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10"
                >
                  See All
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300">
              <p className="text-xl font-medium mb-2">No blog posts found</p>
              <p className="text-sm">Please visit my blog directly to see my latest articles.</p>
              <a 
                href="https://arifeq.blogspot.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-emerald-700 font-bold hover:underline"
              >
                Visit arifeq.blogspot.com <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* --- Academic Paper Modal --- */}
      <AnimatePresence>
        {selectedAcademicPaper && (
          <ResearchPaperView 
            paper={selectedAcademicPaper} 
            onClose={() => setSelectedAcademicPaper(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- Full Blog Post Modal --- */}
      <AnimatePresence>
        {selectedBlogPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
              <button 
                onClick={() => setSelectedBlogPost(null)}
                className="fixed top-6 right-6 z-10 p-3 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
              >
                <X className="w-6 h-6" />
              </button>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-8">
                  <span className="text-emerald-700 font-bold uppercase tracking-widest text-sm mb-4 block">
                    {selectedBlogPost.published}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-8 leading-tight">
                    {selectedBlogPost.title}
                  </h1>
                </div>

                <div className="aspect-video rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl">
                  <img 
                    src={selectedBlogPost.image} 
                    alt={selectedBlogPost.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="blog-content prose prose-lg prose-emerald max-w-none text-slate-700 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: selectedBlogPost.content }} />
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 flex justify-center items-center gap-6">
                  <button 
                    onClick={() => setSelectedBlogPost(null)}
                    className="px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all"
                  >
                    Back to Portfolio
                  </button>
                  <CopyLinkButton url={window.location.href} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- All Blog Posts View --- */}
      <AnimatePresence>
        {showAllPosts && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-white overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4">All Articles</h2>
                  <p className="text-lg text-slate-600">Browse through all my writings and insights.</p>
                </div>
                <button 
                  onClick={() => setShowAllPosts(false)}
                  className="p-4 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 group hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                        {post.published}
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 mb-8 line-clamp-3 text-sm leading-relaxed">
                        {post.summary}
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedBlogPost(post);
                          setShowAllPosts(false);
                        }}
                        className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-3 transition-all"
                      >
                        Read More <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-20 text-center">
                <button 
                  onClick={() => setShowAllPosts(false)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl"
                >
                  Close Archive
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- All Gallery View --- */}
      <AnimatePresence>
        {showAllGallery && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-white overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-4">Gallery</h2>
                  <p className="text-lg text-slate-600">A collection of memorable moments and visual highlights.</p>
                </div>
                <button 
                  onClick={() => setShowAllGallery(false)}
                  className="p-4 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedGalleryItems.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGalleryImage(item)}
                    className="relative aspect-[4/3] rounded-[2rem] overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <img 
                      src={item.image} 
                      alt={item.caption} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">{item.date}</p>
                      <h3 className="text-white font-display font-bold text-lg leading-tight">{item.caption}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-20 text-center">
                <button 
                  onClick={() => setShowAllGallery(false)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl"
                >
                  Close Gallery
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Selected Gallery Image Modal --- */}
      <AnimatePresence>
        {selectedGalleryImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <button 
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedGalleryImage.image} 
                alt={selectedGalleryImage.caption} 
                className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-6 text-center">
                <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-2">{selectedGalleryImage.date}</p>
                <h3 className="text-white font-display font-bold text-2xl md:text-3xl">{selectedGalleryImage.caption}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Gallery Section --- */}
      <section id="gallery" className="py-24 md:py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <SectionTitle subtitle="A collection of memorable moments and visual highlights.">Gallery</SectionTitle>
          </div>
          <button 
            onClick={() => setShowAllGallery(true)}
            className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-800 transition-colors group"
          >
            See All <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="relative flex overflow-x-hidden group">
          <motion.div 
            className="flex gap-6 px-3 py-4 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...sortedGalleryItems, ...sortedGalleryItems].map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`}
                onClick={() => setSelectedGalleryImage(item)}
                className="relative w-[280px] md:w-[350px] aspect-[4/3] rounded-[2rem] overflow-hidden cursor-pointer group/card shadow-sm hover:shadow-xl transition-all duration-500 shrink-0"
              >
                <img 
                  src={item.image} 
                  alt={item.caption} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                  <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">{item.date}</p>
                  <h3 className="text-white font-display font-bold text-lg leading-tight">{item.caption}</h3>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="py-20 md:py-32 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="Get In Touch">Contact & Social</SectionTitle>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-display font-bold text-slate-900 mb-6 tracking-tight">Let's Connect</h3>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Feel free to connect with me through my social platforms and email. 
                I'm always open to discussing new ideas, projects, or opportunities.
              </p>
              
              <div className="space-y-6">
                <a 
                  href={`mailto:${getContent('email', 'html.arif@gmail.com')}?subject=Hello%20Arif&body=Your%20message%3A%0A`} 
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Email Me</p>
                    <p className="text-slate-950 font-bold text-lg">{getContent('email', 'html.arif@gmail.com')}</p>
                  </div>
                </a>

                <a 
                  href={`tel:${getContent('phone', '+8801601504117')}`} 
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Call Me</p>
                    <p className="text-slate-950 font-bold text-lg">{getContent('phone', '+88 01601 504117')}</p>
                  </div>
                </a>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Facebook />, label: 'Facebook', href: getContent('facebook', 'https://facebook.com/arifmc2') },
                    { icon: <Linkedin />, label: 'LinkedIn', href: getContent('linkedin', 'https://linkedin.com/in/inarif') },
                    { icon: <Github />, label: 'GitHub', href: getContent('github', 'https://github.com/htmlarif') },
                    { icon: <Twitter />, label: 'X', href: getContent('x', 'https://x.com/htmlarif') },
                    { icon: <Youtube />, label: 'YouTube', href: getContent('youtube', 'https://youtube.com/@htmlarif') },
                    { icon: <MessageCircle />, label: 'WhatsApp', href: getContent('whatsapp', 'https://wa.me/8801601504117') },
                  ].map((social, idx) => (
                    <a 
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all group"
                    >
                      <div className="text-slate-400 group-hover:text-emerald-700 transition-colors mb-3">
                        {social.icon}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Send a Message</h3>
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="Your Name" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="Your Email" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    name="message"
                    required
                    rows={4} 
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:border-emerald-500 transition-colors resize-none" 
                    placeholder="Your Message"
                  ></textarea>
                </div>
                
                <AnimatePresence mode="wait">
                  {formStatus === 'success' && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-600 font-bold text-sm text-center bg-emerald-50 py-3 rounded-xl border border-emerald-100"
                    >
                      Thank you! Your message has been sent successfully.
                    </motion.p>
                  )}
                  {formStatus === 'error' && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-600 font-bold text-sm text-center bg-red-50 py-3 rounded-xl border border-red-100"
                    >
                      Sorry, something went wrong. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {formStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-16 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <a href="#home" className="flex items-center gap-3 justify-center md:justify-start mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600">
                <img 
                  src={getContent('footer_profile_image', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100')} 
                  alt="Profile" 
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight text-slate-900">
                Shahadat Husain <span className="text-emerald-600">Arif</span>
              </span>
            </a>
            <p className="text-slate-500 text-sm">"{getContent('motto', 'Built with learning, creativity, and purpose.')}"</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="text-slate-500 hover:text-emerald-700 transition-colors text-sm font-bold uppercase tracking-widest">
                {item.label}
              </a>
            ))}
          </div>
          
          <div className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} ARIF. All rights reserved.
          </div>
        </div>
        {isLoginModalOpen && (
          <AdminLoginModal 
            onClose={() => setIsLoginModalOpen(false)} 
            onLoginSuccess={() => {
              setIsLoginModalOpen(false);
              setIsAdminDashboardOpen(true);
            }} 
          />
        )}
        {isAdminDashboardOpen && (
          <AdminDashboard onClose={() => setIsAdminDashboardOpen(false)} />
        )}
      </footer>

      {/* --- Scroll to Top --- */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-emerald-600 border border-slate-100 z-40 hover:bg-emerald-50 transition-colors"
      >
        <ChevronRight className="w-6 h-6 -rotate-90" />
      </motion.button>

    </div>
  );
}
