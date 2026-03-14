import React from 'react';
import { FileText } from 'lucide-react';

export const PdfButton = ({ url }: { url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg"
  >
    <FileText className="w-5 h-5" />
    Read Paper PDF
  </a>
);
