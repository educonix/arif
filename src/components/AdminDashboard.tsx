import React, { useState, useEffect } from 'react';
import { User, BookOpen, Briefcase, Image, Mail, Settings, LogOut, X, Menu } from 'lucide-react';
import { db } from '../services/dbClient';
import { AdminForm } from './AdminForm';
import { EducationManager } from './EducationManager';
import { ProjectManager } from './ProjectManager';
import { GalleryManager } from './GalleryManager';
import { FooterManager } from './FooterManager';
import { ProfileManager } from './ProfileManager';

const SidebarItem = ({ label, icon: Icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void, key?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

export const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!db) return;
    setLoading(true);
    const { data, error } = await db.from('site_settings').select('*');
    if (error) {
      console.error('Error loading settings:', error);
      setSettings({});
    } else if (data && data.length > 0) {
      setSettings(data[0]);
    } else {
      setSettings({});
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (db) {
      await db.auth.signOut();
    }
    onClose();
  };

  const tabs: { 
    id: string, 
    label: string, 
    icon: any, 
    title: string, 
    description: string, 
    fields: { key: string, label: string, type: 'text' | 'textarea' }[] 
  }[] = [
    { id: 'profile', label: 'Profile Settings', icon: User, title: 'Profile Settings', description: 'Update your personal information.', fields: [] },
    { id: 'about', label: 'About & Vision', icon: BookOpen, title: 'About & Vision', description: 'Update your about and vision section.', fields: [{ key: 'About_Me_Short _intro', label: 'About Me Short Intro', type: 'textarea' }, { key: 'about_me', label: 'About Me', type: 'textarea' }, { key: 'vision_goals', label: 'Vision & Goals', type: 'textarea' }] },
    { id: 'education', label: 'Education', icon: BookOpen, title: 'Education', description: 'Update your education details.', fields: [] },
    { id: 'projects', label: 'Projects', icon: Briefcase, title: 'Projects', description: 'Update your projects.', fields: [] },
    { id: 'gallery', label: 'Gallery', icon: Image, title: 'Gallery', description: 'Update your gallery.', fields: [] },
    { id: 'contact', label: 'Contact & Social', icon: Mail, title: 'Contact & Social', description: 'Update your contact and social links.', fields: [{ key: 'email', label: 'Email', type: 'text' }, { key: 'phone', label: 'Phone', type: 'text' }, { key: 'facebook', label: 'Facebook', type: 'text' }, { key: 'linkedin', label: 'LinkedIn', type: 'text' }, { key: 'github', label: 'GitHub', type: 'text' }, { key: 'x', label: 'X (Twitter)', type: 'text' }, { key: 'youtube', label: 'YouTube', type: 'text' }, { key: 'whatsapp', label: 'WhatsApp', type: 'text' }] },
    { id: 'footer', label: 'Footer Settings', icon: Settings, title: 'Footer Settings', description: 'Update your footer settings.', fields: [] },
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'fixed inset-0 z-40 bg-white' : 'hidden md:flex'} w-64 border-r border-slate-200 p-6 flex-col`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-xl text-slate-900">Admin</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          {tabs.map(tab => (
            <SidebarItem 
              key={tab.id} 
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id} 
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} 
            />
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>
      
      {/* Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 md:p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">{activeTabConfig?.label}</h1>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : activeTab === 'profile' ? (
              <ProfileManager settings={settings} onUpdate={loadSettings} />
            ) : activeTab === 'education' ? (
              <EducationManager />
            ) : activeTab === 'projects' ? (
              <ProjectManager />
            ) : activeTab === 'gallery' ? (
              <GalleryManager />
            ) : activeTab === 'footer' ? (
              <FooterManager settings={settings} onUpdate={loadSettings} />
            ) : settings ? (
              <AdminForm 
                title={activeTabConfig?.title || ''} 
                description={activeTabConfig?.description || ''} 
                fields={activeTabConfig?.fields || []} 
                settings={settings} 
                onUpdate={loadSettings} 
              />
            ) : (
              <p className="text-slate-500">Error loading settings.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
