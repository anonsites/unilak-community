'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface EditProfileModalProps {
  userId: string;
  currentUsername: string;
  currentAvatarUrl?: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const EMOJIS = [
  '😀', '😁', '😒', '😜', '😂', // 5 Smileys
  '🐶', '🐱', '🦁', '🐯', '🐻'  // 5 Animals
];

export default function EditProfileModal({ 
  userId, 
  currentUsername, 
  currentAvatarUrl, 
  onClose, 
  onUpdate 
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updates: {
        username: string;
        avatar_url?: string;
      } = {
        username,
      };
      
      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles_table')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Choose Avatar</label>
            
            <div className="grid grid-cols-5 gap-2 p-2 bg-black/30 rounded-xl border border-white/10">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  className={`relative text-3xl p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    avatarUrl === emoji 
                      ? 'bg-blue-500/20 border-2 border-blue-500 scale-110 shadow-lg shadow-blue-500/20 z-10' 
                      : 'border border-transparent hover:bg-white/5 hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  {emoji}
                  {avatarUrl === emoji && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}