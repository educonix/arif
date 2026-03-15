import React, { useState, useEffect } from 'react';
import { db } from '../services/dbClient';
import { Plus, Trash2, Edit2, Save, X, GraduationCap, Calendar, Hash, Award } from 'lucide-react';

interface EducationEntry {
  id?: string;
  title: string;
  institution: string;
  group_name: string;
  year: string;
  result: string;
  sort_order: number;
}

export const EducationManager = () => {
  const [entries, setEntries] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<EducationEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    if (!db) return;
    setLoading(true);
    const { data, error } = await db
      .from('education_table')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching education:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (entry: EducationEntry) => {
    if (!db) return;
    setLoading(true);
    try {
      const submissionData = {
        title: entry.title,
        institution: entry.institution,
        group_name: entry.group_name,
        year: entry.year,
        result: entry.result,
        sort_order: entry.sort_order
      };

      if (entry.id) {
        console.log('Updating education entry with ID:', entry.id);
        const { error } = await db.from('education_table').update(submissionData).eq('id', entry.id);
        if (error) throw error;
        alert('Education entry updated successfully!');
      } else {
        console.log('Adding new education entry');
        const { error } = await db.from('education_table').insert([submissionData]);
        if (error) throw error;
        alert('Education entry added successfully!');
      }
      setEditingEntry(null);
      setIsAdding(false);
      fetchEntries();
    } catch (error: any) {
      console.error('Error saving education:', error);
      alert('Error saving education: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!db) {
      console.error('Database client not initialized');
      return;
    }
    if (confirm('Are you sure you want to delete this education entry?')) {
      setLoading(true);
      try {
        console.log('Deleting education entry with ID:', id);
        const { error } = await db.from('education_table').delete().eq('id', id);
        
        if (error) {
          console.error('Delete error:', error);
          throw error;
        }
        
        console.log('Education entry deleted successfully');
        alert('Education entry deleted!');
        fetchEntries();
      } catch (error: any) {
        console.error('Error in handleDelete:', error);
        alert('Error deleting education: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Education</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your academic background.</p>
        </div>
        {!isAdding && !editingEntry && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {(isAdding || editingEntry) && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h3>
            <button onClick={() => { setEditingEntry(null); setIsAdding(false); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <EducationForm 
            entry={editingEntry || { title: '', institution: '', group_name: '', year: '', result: '', sort_order: entries.length + 1 }}
            onSave={handleSave}
            onCancel={() => { setEditingEntry(null); setIsAdding(false); }}
          />
        </div>
      )}

      <div className="space-y-4">
        {loading && entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading education entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">No education entries found. Add your first one!</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">{entry.title}</h4>
                  <p className="text-slate-600 text-sm">{entry.institution}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] sm:text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {entry.year}</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {entry.result}</span>
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Order: {entry.sort_order}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-t sm:border-t-0 pt-3 sm:pt-0">
                <button 
                  onClick={() => setEditingEntry(entry)} 
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-2 sm:block"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="sm:hidden text-sm font-medium">Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(entry.id!)} 
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 sm:block"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="sm:hidden text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const EducationForm = ({ entry, onSave, onCancel }: { entry: EducationEntry, onSave: (e: EducationEntry) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState(entry);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Degree / Title</label>
          <input 
            type="text" 
            placeholder="e.g. Bachelor of Science" 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Institution</label>
          <input 
            type="text" 
            placeholder="e.g. University Name" 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
            value={formData.institution} 
            onChange={e => setFormData({...formData, institution: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Group / Major</label>
          <input 
            type="text" 
            placeholder="e.g. Computer Science" 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
            value={formData.group_name} 
            onChange={e => setFormData({...formData, group_name: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Year</label>
          <input 
            type="text" 
            placeholder="e.g. 2018 - 2022" 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
            value={formData.year} 
            onChange={e => setFormData({...formData, year: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Result / GPA</label>
          <input 
            type="text" 
            placeholder="e.g. 3.8/4.0" 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
            value={formData.result} 
            onChange={e => setFormData({...formData, result: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sort Order</label>
          <input 
            type="number" 
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" 
            value={formData.sort_order} 
            onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} 
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <button 
          onClick={onCancel} 
          className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(formData)} 
          className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};

