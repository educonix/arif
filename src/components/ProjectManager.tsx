import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash2, Edit2, Save, X, Upload, Eye, EyeOff, ExternalLink, Image } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

interface ProjectEntry {
  id?: string;
  title: string;
  short_description: string;
  full_description: string;
  project_url: string;
  cover_image: string;
  sort_order: number;
  is_visible: boolean;
}

export const ProjectManager = () => {
  const [entries, setEntries] = useState<ProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<ProjectEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects_table')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (entry: ProjectEntry) => {
    setLoading(true);
    try {
      const submissionData = {
        title: entry.title,
        short_description: entry.short_description,
        full_description: entry.full_description,
        project_url: entry.project_url,
        cover_image: entry.cover_image,
        sort_order: entry.sort_order,
        is_visible: entry.is_visible
      };

      if (entry.id) {
        console.log('Updating project with ID:', entry.id);
        const { error } = await supabase.from('projects_table').update(submissionData).eq('id', entry.id);
        if (error) throw error;
        alert('Project updated!');
        setEditingEntry(null);
        fetchEntries();
      } else {
        console.log('Adding new project');
        const { error } = await supabase.from('projects_table').insert([submissionData]);
        if (error) throw error;
        alert('Project added!');
        setIsAdding(false);
        fetchEntries();
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      alert('Error saving project: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    if (confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      try {
        console.log('Deleting project with ID:', id);
        
        // Find entry to get image URL
        const project = entries.find(e => e.id === id);
        
        // Delete image from storage if exists
        if (project?.cover_image && project.cover_image.includes('project_cover')) {
          try {
            const path = project.cover_image.split('project_cover/').pop();
            if (path) {
              console.log('Deleting project image from storage:', path);
              const { error: storageError } = await supabase.storage
                .from('project_cover')
                .remove([path]);
              if (storageError) {
                console.error('Storage deletion failed:', storageError);
              } else {
                console.log('Storage image deleted successfully');
              }
            }
          } catch (storageErr) {
            console.error('Error during storage deletion:', storageErr);
          }
        }

        console.log('Deleting project row from projects_table...');
        const { error } = await supabase.from('projects_table').delete().eq('id', id);
        
        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }
        
        console.log('Project row deleted successfully');
        alert('Project deleted!');
        fetchEntries();
      } catch (error: any) {
        console.error('Error in handleDelete:', error);
        alert('Error deleting project: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleVisibility = async (entry: ProjectEntry) => {
    const { error } = await supabase
      .from('projects_table')
      .update({ is_visible: !entry.is_visible })
      .eq('id', entry.id);
    
    if (error) alert('Error toggling visibility');
    else fetchEntries();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Projects</h3>
          <p className="text-sm text-slate-500">Manage your portfolio projects</p>
        </div>
        <button 
          onClick={() => {
            setEditingEntry(null);
            setIsAdding(true);
          }} 
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {(isAdding || editingEntry) && (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
          <ProjectForm 
            entry={editingEntry || { 
              title: '', 
              short_description: '', 
              full_description: '', 
              project_url: '', 
              cover_image: '', 
              sort_order: entries.length + 1,
              is_visible: true 
            }}
            onSave={handleSave}
            onCancel={() => { setEditingEntry(null); setIsAdding(false); }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {entries.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-400">No projects found. Add your first project!</p>
          </div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
              {entry.cover_image ? (
                <img src={entry.cover_image} alt={entry.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Image className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-lg text-slate-900 truncate">{entry.title}</h4>
                {!entry.is_visible && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Hidden
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm line-clamp-2 mb-2">{entry.short_description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Order: {entry.sort_order}</span>
                {entry.project_url && (
                  <a href={entry.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Visit Link
                  </a>
                )}
              </div>
            </div>
            <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
              <button 
                onClick={() => toggleVisibility(entry)} 
                className={`p-2 rounded-lg transition-colors ${entry.is_visible ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                title={entry.is_visible ? "Hide project" : "Show project"}
              >
                {entry.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setEditingEntry(entry)} 
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit project"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(entry.id!)} 
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectForm = ({ entry, onSave, onCancel }: { entry: ProjectEntry, onSave: (e: ProjectEntry) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState(entry);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageSrc(reader.result?.toString() || null);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setSelectedImageSrc(null);
    setUploading(true);
    try {
      const fileExt = 'jpeg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project_cover')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project_cover')
        .getPublicUrl(filePath);

      setFormData({ ...formData, cover_image: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project Title</label>
            <input 
              type="text" 
              placeholder="e.g. BoiCloud" 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project URL</label>
            <input 
              type="text" 
              placeholder="https://..." 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
              value={formData.project_url} 
              onChange={e => setFormData({...formData, project_url: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Short Description</label>
            <textarea 
              placeholder="Brief summary for the card..." 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-24 resize-none" 
              value={formData.short_description} 
              onChange={e => setFormData({...formData, short_description: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Image</label>
            <div className="flex gap-4 items-start">
              <div className="w-32 h-32 rounded-xl bg-white border-2 border-dashed border-slate-200 overflow-hidden flex-shrink-0 relative group">
                {formData.cover_image ? (
                  <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">No Image</span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> {formData.cover_image ? 'Change Image' : 'Upload Image'}
                </button>
                <input 
                  type="text" 
                  placeholder="Or paste image URL..." 
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none" 
                  value={formData.cover_image} 
                  onChange={e => setFormData({...formData, cover_image: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sort Order</label>
              <input 
                type="number" 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
                value={formData.sort_order} 
                onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} 
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  onClick={() => setFormData({...formData, is_visible: !formData.is_visible})}
                  className={`w-10 h-6 rounded-full transition-colors relative ${formData.is_visible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_visible ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Visible on Site</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {selectedImageSrc && (
        <ImageCropperModal
          isOpen={cropModalOpen}
          imageSrc={selectedImageSrc}
          aspectRatio={16 / 9} // 16:9 for project cover
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Description (Markdown supported)</label>
        <textarea 
          placeholder="Detailed project information..." 
          className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-48 resize-y" 
          value={formData.full_description} 
          onChange={e => setFormData({...formData, full_description: e.target.value})} 
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
        <button 
          onClick={onCancel} 
          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(formData)} 
          className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10"
        >
          Save Project
        </button>
      </div>
    </div>
  );
};
