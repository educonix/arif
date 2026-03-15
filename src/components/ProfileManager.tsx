import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/dbClient';
import { Upload, Save, User, Image as ImageIcon, X } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

export const ProfileManager = ({ settings, onUpdate }: { settings: any, onUpdate: () => void }) => {
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageSrc(reader.result?.toString() || null);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setSelectedImageSrc(null);
    if (!db) return;
    
    setUploading(true);
    const fileExt = 'jpeg'; // Blob is jpeg from cropper
    const fileName = `profile-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile/${fileName}`;

    try {
      const { error: uploadError } = await db.storage
        .from('profile_photo')
        .upload(filePath, croppedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = db.storage
        .from('profile_photo')
        .getPublicUrl(filePath);

      setLocalSettings({ ...localSettings, profile_image: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    // Ensure we are updating the existing row. 
    // site_settings usually has a single row.
    const { error } = await db.from('site_settings').upsert(localSettings);
    
    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      alert('Profile settings saved successfully!');
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
        <p className="text-slate-500 mt-1">Update your personal information and profile picture.</p>
      </div>
      
      <div className="space-y-6">
        {/* Profile Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-4">Profile Image</label>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
              {localSettings.profile_image ? (
                <img 
                  src={localSettings.profile_image} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User className="w-16 h-16" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3 text-center md:text-left">
              <p className="text-sm text-slate-500">
                This image will be used as your main profile picture across the site.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </button>
                {localSettings.profile_image && (
                  <button 
                    type="button"
                    onClick={() => setLocalSettings({...localSettings, profile_image: ''})}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
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
        </div>

        {selectedImageSrc && (
          <ImageCropperModal
            isOpen={cropModalOpen}
            imageSrc={selectedImageSrc}
            aspectRatio={1} // 1:1 for profile photo
            onClose={() => {
              setCropModalOpen(false);
              setSelectedImageSrc(null);
            }}
            onCropComplete={handleCropComplete}
          />
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              value={localSettings.full_name || ''} 
              onChange={(e) => setLocalSettings({...localSettings, full_name: e.target.value})} 
              className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nickname</label>
            <input 
              type="text" 
              value={localSettings.nickname || ''} 
              onChange={(e) => setLocalSettings({...localSettings, nickname: e.target.value})} 
              className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
              placeholder="Your nickname"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tagline</label>
          <input 
            type="text" 
            value={localSettings.tagline || ''} 
            onChange={(e) => setLocalSettings({...localSettings, tagline: e.target.value})} 
            className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
            placeholder="A short tagline about you"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Subtag (Intro under Tagline)</label>
          <textarea 
            value={localSettings.subtag || ''} 
            onChange={(e) => setLocalSettings({...localSettings, subtag: e.target.value})} 
            className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
            rows={3}
            placeholder="A few lines of intro text under your tagline..."
          />
        </div>
      </div>
      
      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
          onClick={save} 
          disabled={loading || uploading} 
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-emerald-600/20 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
