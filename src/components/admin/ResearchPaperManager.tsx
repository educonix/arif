import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ResearchPaper } from '../../types/research';
import { MathEditor } from './MathEditor';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';

export const ResearchPaperManager: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<Partial<ResearchPaper> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching papers:', error);
    } else {
      setPapers(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPaper?.title || !editingPaper?.content) {
      alert('Title and content are required.');
      return;
    }

    setSaving(true);
    
    const paperData = {
      ...editingPaper,
      slug: editingPaper.slug || editingPaper.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      updated_at: new Date().toISOString(),
    };

    if (!paperData.id) {
      paperData.id = crypto.randomUUID();
      paperData.created_at = new Date().toISOString();
      
      const { error } = await supabase.from('research_papers').insert([paperData]);
      if (error) console.error('Error creating paper:', error);
    } else {
      const { error } = await supabase
        .from('research_papers')
        .update(paperData)
        .eq('id', paperData.id);
      if (error) console.error('Error updating paper:', error);
    }

    setSaving(false);
    setEditingPaper(null);
    fetchPapers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    
    const { error } = await supabase.from('research_papers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting paper:', error);
    } else {
      fetchPapers();
    }
  };

  if (editingPaper) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {editingPaper.id ? 'Edit Paper' : 'New Paper'}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setEditingPaper(null)}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Paper'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={editingPaper.title || ''}
                onChange={(e) => setEditingPaper({ ...editingPaper, title: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
              <input
                type="text"
                value={editingPaper.author || ''}
                onChange={(e) => setEditingPaper({ ...editingPaper, author: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Abstract</label>
              <textarea
                value={editingPaper.abstract || ''}
                onChange={(e) => setEditingPaper({ ...editingPaper, abstract: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={editingPaper.status || 'draft'}
                onChange={(e) => setEditingPaper({ ...editingPaper, status: e.target.value as 'draft' | 'published' })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (comma separated)</label>
              <input
                type="text"
                value={Array.isArray(editingPaper.keywords) ? editingPaper.keywords.join(', ') : editingPaper.keywords || ''}
                onChange={(e) => setEditingPaper({ ...editingPaper, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
              <input
                type="text"
                value={editingPaper.cover_image || ''}
                onChange={(e) => setEditingPaper({ ...editingPaper, cover_image: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Paper Content (LaTeX + Markdown)</label>
          <MathEditor
            value={editingPaper.content || ''}
            onChange={(content) => setEditingPaper({ ...editingPaper, content })}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Research Papers</h2>
        <button
          onClick={() => setEditingPaper({ status: 'draft', content: '', keywords: [], tags: [] })}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Paper
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-500">No research papers found. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-medium text-slate-600">Title</th>
                <th className="p-4 font-medium text-slate-600">Status</th>
                <th className="p-4 font-medium text-slate-600">Date</th>
                <th className="p-4 font-medium text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{paper.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      paper.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {paper.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(paper.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingPaper(paper)}
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(paper.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
