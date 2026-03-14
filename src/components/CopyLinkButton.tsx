import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CopyLinkButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold transition-all text-sm"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Link copied' : 'Copy Link'}
    </button>
  );
};
