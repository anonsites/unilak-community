'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Toast from './Toast';

interface EditProfileModalProps {
  userId: string;
  currentUsername: string;
  currentAvatarUrl?: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const EMOJIS = [
  '\uD83D\uDE00', '\uD83D\uDE01', '\uD83D\uDE12', '\uD83D\uDE1C', '\uD83D\uDE02', // 5 Smileys
  '\uD83D\uDC36', '\uD83D\uDC31', '\uD83E\uDD81', '\uD83D\uDC2F', '\uD83D\uDC3B', // 5 Animals
  '\u2615', '\uD83C\uDF7B', '\uD83C\uDF49', '\uD83C\uDF4C', '\uD83C\uDF4A'      // 5 Food/Drink
];

export default function EditProfileModal({ 
  userId, 
  currentUsername, 
  currentAvatarUrl, 
  onClose, 
  onUpdate 
}: EditProfileModalProps) {
  const supabase = createClient();
  const [username, setUsername] = useState(currentUsername);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

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

      setToast({ message: 'Profile updated successfully!', type: 'success' });
      onUpdate();
      setTimeout(onClose, 2000);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}