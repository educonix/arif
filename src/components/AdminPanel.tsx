import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AdminPanel = () => {
  const [content, setContent] = useState({
    full_name: '',
    tagline: '',
    subtag: '',
    about_short_intro: '',
  });

  const handleUpdate = async (key: string, value: string) => {
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value });
    if (error) console.error('Error updating content:', error);
    else alert('Content updated successfully!');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={content.full_name}
            onChange={(e) => setContent({ ...content, full_name: e.target.value })}
            onBlur={() => handleUpdate('full_name', content.full_name)}
          />
        </div>
        {/* Add more fields here */}
      </div>
    </div>
  );
};
