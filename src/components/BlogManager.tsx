import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash2, Edit2, Save, X, Upload, Eye, EyeOff, ExternalLink, Image, Calendar, Star } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  publish_date: string;
  status: 'draft' | 'published';
  featured: boolean;
}

export const BlogManager = () => {
  const [entries, setEntries] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<BlogPost | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('publish_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching blogs:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (entry: BlogPost) => {
    setLoading(true);
    try {
      const submissionData = {
        title: entry.title,
        slug: entry.slug,
        excerpt: entry.excerpt,
        content: entry.content,
        cover_image: entry.cover_image,
        author: entry.author,
        publish_date: entry.publish_date || new Date().toISOString().split('T')[0],
        status: entry.status,
        featured: entry.featured,
        updated_at: new Date().toISOString()
      };

      if (entry.id) {
        const { error } = await supabase.from('blog_posts').update(submissionData).eq('id', entry.id);
        if (error) throw error;
        alert('Blog post updated!');
        setEditingEntry(null);
        fetchEntries();
      } else {
        const { error } = await supabase.from('blog_posts').insert([submissionData]);
        if (error) throw error;
        alert('Blog post added!');
        setIsAdding(false);
        fetchEntries();
      }
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      alert('Error saving blog post: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setLoading(true);
      try {
        const post = entries.find(e => e.id === id);
        
        if (post?.cover_image && post.cover_image.includes('blog_cover')) {
          try {
            const path = post.cover_image.split('blog_cover/').pop();
            if (path) {
              await supabase.storage.from('blog_cover').remove([path]);
            }
          } catch (e) {
            console.error('Error deleting image:', e);
          }
        }

        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) throw error;
        alert('Blog post deleted!');
        fetchEntries();
      } catch (error: any) {
        console.error('Error deleting blog post:', error);
        alert('Error deleting blog post: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, entry: BlogPost, setEntry: (e: BlogPost) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog_cover')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback to project_cover if blog_cover doesn't exist
        if (uploadError.message.includes('Bucket not found')) {
           const { error: fallbackError } = await supabase.storage
            .from('project_cover')
            .upload(`blog_${filePath}`, file);
            
            if (fallbackError) throw fallbackError;
            
            const { data: { publicUrl } } = supabase.storage
              .from('project_cover')
              .getPublicUrl(`blog_${filePath}`);
              
            setEntry({ ...entry, cover_image: publicUrl });
            return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog_cover')
        .getPublicUrl(filePath);

      setEntry({ ...entry, cover_image: publicUrl });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  const renderForm = (entry: BlogPost, setEntry: (e: BlogPost) => void, onCancel: () => void) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-800">{entry.id ? 'Edit Blog Post' : 'Add New Blog Post'}</h3>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={entry.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setEntry({ 
                  ...entry, 
                  title: newTitle,
                  slug: entry.id ? entry.slug : generateSlug(newTitle)
                });
              }}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="Post Title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              value={entry.slug}
              onChange={(e) => setEntry({ ...entry, slug: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="post-url-slug"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
            <input
              type="text"
              value={entry.author}
              onChange={(e) => setEntry({ ...entry, author: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="Author Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Publish Date</label>
            <input
              type="date"
              value={entry.publish_date}
              onChange={(e) => setEntry({ ...entry, publish_date: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={entry.status}
              onChange={(e) => setEntry({ ...entry, status: e.target.value as 'draft' | 'published' })}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex items-center h-full pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={entry.featured}
                onChange={(e) => setEntry({ ...entry, featured: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Star className={`w-4 h-4 ${entry.featured ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                Featured Post
              </span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image</label>
          <div className="flex items-start gap-4">
            {entry.cover_image && (
              <div className="w-32 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 relative">
                <img src={entry.cover_image} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setEntry({ ...entry, cover_image: '' })}
                  className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-600 hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e, entry, setEntry)}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Cover Image'}
              </button>
              <p className="text-xs text-slate-500 mt-2">Or paste image URL below:</p>
              <input
                type="text"
                value={entry.cover_image}
                onChange={(e) => setEntry({ ...entry, cover_image: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Excerpt</label>
          <textarea
            value={entry.excerpt}
            onChange={(e) => setEntry({ ...entry, excerpt: e.target.value })}
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            rows={3}
            placeholder="Short summary of the post..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <ReactQuill 
              theme="snow" 
              value={entry.content} 
              onChange={(content) => setEntry({ ...entry, content })}
              modules={modules}
              formats={formats}
              className="h-64 mb-12"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(entry)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </div>
  );

  if (loading && !entries.length) {
    return <div className="p-8 text-center text-slate-500">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Blog Management</h2>
          <p className="text-slate-500 mt-1">Manage your blog posts and articles.</p>
        </div>
        {!editingEntry && (
          <button
            onClick={() => setEditingEntry({
              title: '', slug: '', excerpt: '', content: '', cover_image: '', author: '', 
              publish_date: new Date().toISOString().split('T')[0], status: 'draft', featured: false 
            })}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            Add Post
          </button>
        )}
      </div>

      {editingEntry ? (
        renderForm(editingEntry, setEditingEntry, () => setEditingEntry(null))
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-4 font-semibold">Cover</th>
                  <th className="p-4 font-semibold">Title</th>
                  <th className="p-4 font-semibold">Author</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Featured</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        {entry.cover_image ? (
                          <img src={entry.cover_image} alt={entry.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{entry.title}</td>
                    <td className="p-4 text-slate-600">{entry.author}</td>
                    <td className="p-4 text-slate-600">{new Date(entry.publish_date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        entry.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {entry.featured ? <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> : <Star className="w-5 h-5 text-slate-300" />}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No blog posts found. Click "Add Post" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
