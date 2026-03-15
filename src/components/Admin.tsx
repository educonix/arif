import React, { useState } from 'react';
import { db } from '../services/dbClient';

export const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      onLogin();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 border rounded-lg" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-4 border rounded-lg" />
          <button type="submit" className="w-full p-3 bg-emerald-700 text-white rounded-lg font-bold">Login</button>
        </form>
        <button onClick={onClose} className="w-full mt-4 text-slate-500">Close</button>
      </div>
    </div>
  );
};

export const AdminPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [tagline, setTagline] = useState('');

  if (!isOpen) return null;

  const handleUpdate = async () => {
    const { error } = await db.from('site_settings').upsert({ id: 1, full_name: fullName, tagline: tagline });
    if (error) {
      alert(error.message);
    } else {
      alert('Settings updated!');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>
      <button onClick={onClose} className="mb-8 px-6 py-2 bg-slate-200 rounded-lg">Close</button>
      <div className="mb-4">
        <label className="block mb-2">Full Name</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-lg" />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Tagline</label>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full p-3 border rounded-lg" />
      </div>
      <button onClick={handleUpdate} className="px-6 py-3 bg-emerald-700 text-white rounded-lg font-bold">Update Settings</button>
    </div>
  );
};
