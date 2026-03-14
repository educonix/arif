import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AdminLoginModal = ({ onClose, onLoginSuccess }: { onClose: () => void; onLoginSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Admin service is not configured.');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg p-2" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg p-2" required />
          <button type="submit" className="w-full bg-emerald-600 text-white rounded-lg p-2">Login</button>
        </form>
        <button onClick={onClose} className="mt-4 w-full text-sm text-gray-500">Close</button>
      </div>
    </div>
  );
};
