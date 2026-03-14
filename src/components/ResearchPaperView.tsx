import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ResearchPaper } from '../types/research';
import { CopyLinkButton } from './CopyLinkButton';

interface ResearchPaperViewProps {
  paper: ResearchPaper;
  onClose: () => void;
}

export const ResearchPaperView: React.FC<ResearchPaperViewProps> = ({ paper, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={onClose}
          className="fixed top-6 right-6 z-10 p-3 bg-slate-100 rounded-full text-slate-900 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.article 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="academic-paper"
        >
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <CopyLinkButton url={window.location.href} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
              {paper.title}
            </h1>
            {paper.subtitle && (
              <h2 className="text-2xl text-slate-600 mb-6 font-display">
                {paper.subtitle}
              </h2>
            )}
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-500 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-slate-700">{paper.author || 'Author'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(paper.published_at || paper.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Abstract */}
            {paper.abstract && (
              <div className="max-w-3xl mx-auto bg-slate-50 p-8 rounded-2xl border border-slate-100 text-left mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-3">Abstract</h3>
                <p className="text-slate-700 leading-relaxed italic">
                  {paper.abstract}
                </p>
              </div>
            )}

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {paper.keywords.map((keyword, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-full">
                    <Tag className="w-3 h-3" />
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {paper.cover_image && (
            <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-xl border border-slate-100">
              <img 
                src={paper.cover_image} 
                alt={paper.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-slate max-w-none academic-content mx-auto">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {paper.content}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-10 border-t border-slate-200 flex justify-center">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-all"
            >
              Close Paper
            </button>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
};
