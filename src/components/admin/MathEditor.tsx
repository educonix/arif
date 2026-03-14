import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MathEditor: React.FC<MathEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newValue = value.substring(0, start) + snippet + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + snippet.length;
        textareaRef.current.selectionEnd = start + snippet.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const snippets = [
    { label: '∑', value: '$\\sum_{i=1}^{n}$ ' },
    { label: '∫', value: '$\\int_{a}^{b} f(x) dx$ ' },
    { label: '[ ]', value: '\n$$\n\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}\n$$\n' },
    { label: '≡', value: '\n$$\n\\begin{aligned}\nx &= y + z \\\\\n  &= 2y\n\\end{aligned}\n$$\n' },
    { label: 'Thm', value: '\n<div class="theorem">\n**Theorem 1.1.** *Statement here...*\n</div>\n' },
    { label: 'Prf', value: '\n<div class="proof">\n*Proof.* Your proof here... $\\blacksquare$\n</div>\n' },
    { label: 'Lem', value: '\n<div class="lemma">\n**Lemma 1.1.** *Statement here...*\n</div>\n' },
    { label: 'Def', value: '\n<div class="definition">\n**Definition 1.1.** *Definition here...*\n</div>\n' },
  ];

  return (
    <div className="flex flex-col h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b border-slate-200 bg-slate-50">
        {snippets.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => insertSnippet(s.value)}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
            title={s.label}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-1/2 p-4 font-mono text-sm resize-none outline-none border-r border-slate-200 focus:ring-0"
          placeholder="Write your LaTeX and Markdown here..."
        />
        <div className="w-1/2 p-4 overflow-y-auto bg-slate-50">
          <div className="prose prose-slate max-w-none academic-content">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {value}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
