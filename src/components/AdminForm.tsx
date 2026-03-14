import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AdminForm = ({ title, description, fields, settings, onUpdate }: { title: string, description: string, fields: { key: string, label: string, type: 'text' | 'textarea' }[], settings: any, onUpdate: () => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const { error } = await supabase.from('site_settings').upsert(localSettings);
    if (error) alert('Error saving settings: ' + error.message);
    else {
      alert('Settings saved successfully!');
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      
      <div className="space-y-6">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
            {field.type === 'text' ? (
              <input 
                type="text" 
                value={localSettings[field.key] || ''} 
                onChange={(e) => setLocalSettings({...localSettings, [field.key]: e.target.value})} 
                className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
              />
            ) : (
              <textarea 
                value={localSettings[field.key] || ''} 
                onChange={(e) => setLocalSettings({...localSettings, [field.key]: e.target.value})} 
                className="w-full border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
                rows={5} 
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-slate-100 flex justify-end">
        <button 
          onClick={save} 
          disabled={loading} 
          className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-emerald-600/20"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
