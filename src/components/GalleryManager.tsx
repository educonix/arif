import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/dbClient';
import { Plus, Trash2, Edit2, Save, X, Upload, Eye, EyeOff, Image, Calendar, Hash } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

interface GalleryEntry {
  id?: string;
  image_url: string;
  caption: string;
  photo_date: string;
  sort_order: number;
  is_visible: boolean;
}

export const GalleryManager = () => {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const [formData, setFormData] = useState<GalleryEntry>({
    image_url: '',
    caption: '',
    photo_date: new Date().toISOString().split('T')[0],
    sort_order: 0,
    is_visible: true
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    if (!db) return;
    setLoading(true);
    const { data, error } = await db
      .from('gallery_table')
      .select('*')
      .order('photo_date', { ascending: false })
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching gallery:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

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
    if (!db) return;
    
    setUploading(true);
    const fileExt = 'jpeg';
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    try {
      const { error: uploadError } = await db.storage
        .from('gallery_photo')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = db.storage
        .from('gallery_photo')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setLoading(true);
    try {
      const submissionData = {
        image_url: formData.image_url,
        caption: formData.caption,
        photo_date: formData.photo_date,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible
      };

      if (editingId) {
        console.log('Updating gallery item with ID:', editingId);
        const { error } = await db
          .from('gallery_table')
          .update(submissionData)
          .eq('id', editingId);
        if (error) throw error;
        alert('Gallery item updated successfully!');
      } else {
        console.log('Adding new gallery item');
        const { error } = await db
          .from('gallery_table')
          .insert([submissionData]);
        if (error) throw error;
        alert('Gallery item added successfully!');
      }
      
      setFormData({
        image_url: '',
        caption: '',
        photo_date: new Date().toISOString().split('T')[0],
        sort_order: 0,
        is_visible: true
      });
      setIsAdding(false);
      setEditingId(null);
      fetchEntries();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert('Error saving gallery item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: GalleryEntry) => {
    console.log('Editing gallery item:', entry.id);
    setFormData({
      image_url: entry.image_url,
      caption: entry.caption,
      photo_date: entry.photo_date,
      sort_order: entry.sort_order,
      is_visible: entry.is_visible
    });
    setEditingId(entry.id || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: any) => {
    if (!db) {
      console.error('Database client not initialized');
      return;
    }
    if (!confirm('Are you sure you want to delete this photo?')) return;

    setLoading(true);
    try {
      console.log('Deleting gallery item with ID:', id);
      
      // Find entry to get image URL
      const item = entries.find(e => e.id === id);
      
      // Delete image from storage if exists
      if (item?.image_url && item.image_url.includes('gallery_photo')) {
        try {
          const path = item.image_url.split('gallery_photo/').pop();
          if (path) {
            console.log('Deleting gallery image from storage:', path);
            const { error: storageError } = await db.storage
              .from('gallery_photo')
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

      console.log('Deleting gallery row from gallery_table...');
      const { error } = await db
        .from('gallery_table')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      console.log('Gallery row deleted successfully');
      alert('Gallery item deleted!');
      fetchEntries();
    } catch (error: any) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting gallery item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (entry: GalleryEntry) => {
    if (!db) return;
    try {
      const { error } = await db
        .from('gallery_table')
        .update({ is_visible: !entry.is_visible })
        .eq('id', entry.id);
      if (error) throw error;
      fetchEntries();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold text-slate-900">Gallery Items</h3>
        {!isAdding && (
          <button
            onClick={() => {
              setFormData({
                image_url: '',
                caption: '',
                photo_date: new Date().toISOString().split('T')[0],
                sort_order: 0,
                is_visible: true
              });
              setEditingId(null);
              setIsAdding(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Photo
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-900">{editingId ? 'Edit Photo' : 'Add New Photo'}</h4>
            <button 
              type="button" 
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Photo Upload</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all overflow-hidden relative group"
                >
                  {formData.image_url ? (
                    <>
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-2">
                        {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div> : <Upload className="w-6 h-6" />}
                      </div>
                      <p className="text-sm font-medium text-slate-500">{uploading ? 'Uploading...' : 'Click to upload photo'}</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Caption</label>
                <input
                  type="text"
                  required
                  value={formData.caption}
                  onChange={e => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Enter photo caption"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Photo Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.photo_date}
                      onChange={e => setFormData({ ...formData, photo_date: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sort Order</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={formData.is_visible}
                  onChange={e => setFormData({ ...formData, is_visible: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_visible" className="text-sm font-bold text-slate-700">Visible on website</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {editingId ? 'Update Photo' : 'Save Photo'}
            </button>
          </div>
        </form>
      )}

      {selectedImageSrc && (
        <ImageCropperModal
          isOpen={cropModalOpen}
          imageSrc={selectedImageSrc}
          aspectRatio={1} // 1:1 for gallery photo
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}

      <div className="space-y-4">
        {loading && entries.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading gallery items...</p>
          </div>
        )}
        
        {!loading && entries.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Image className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No gallery items found. Add your first photo!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map(entry => (
            <div key={entry.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group">
              <div className="w-full sm:w-32 h-48 sm:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={entry.image_url} alt={entry.caption} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 truncate">{entry.caption}</h4>
                    {!entry.is_visible && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {entry.photo_date}</span>
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Order: {entry.sort_order}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 sm:mt-2 pt-3 sm:pt-0 border-t sm:border-t-0">
                  <button
                    onClick={() => toggleVisibility(entry)}
                    className={`p-2 rounded-lg transition-colors ${entry.is_visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    title={entry.is_visible ? 'Hide from website' : 'Show on website'}
                  >
                    {entry.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
