'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import AccountStats from '@/components/AccountStats';
import ConfirmModal from '@/components/ConfirmModal';
import EditProfileModal from '@/components/EditProfileModal';
import Avatar from '@/components/Avatar';

type ReviewWithRelations = Database['public']['Tables']['reviews_table']['Row'] & {
  profiles_table: { username: string } | null;
  topics_table: { name: string } | null;
  subtopics_table: { name: string } | null;
};

type ProfileWithExtras = Database['public']['Tables']['profiles_table']['Row'] & {
  avatar_url?: string | null;
  role?: string | null;
};

interface AccountClientProps {
  user: User;
  profile: Database['public']['Tables']['profiles_table']['Row'] | null;
  reviews: ReviewWithRelations[];
}

export default function AccountClient({ user, profile, reviews }: AccountClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.from('profiles_table').delete().eq('id', user.id);
      if (error) throw error;
      
      await handleSignOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const username = profile?.username;
  let avatarLetter = '?';
  if (username) {
    avatarLetter = username.startsWith('anon_') 
      ? (username.charAt(5) || username.charAt(0)).toUpperCase() 
      : username.charAt(0).toUpperCase();
  } else if (user?.email) {
    avatarLetter = user.email.charAt(0).toUpperCase();
  }

  const avatarUrl = (profile as ProfileWithExtras | null)?.avatar_url;

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-gray-600 via-blue-500 to-gray-400 py-12 shadow-xl mb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-md">MY ACCOUNT</h1>
          <Link href="/" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 px-4 md:px-8 pb-12">
       {/* Account Info Card */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-8 shadow-2xl">
                
        {/* Top Section: Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div key={avatarUrl} className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg ring-4 ring-black overflow-hidden animate-in zoom-in duration-300">
              <Avatar 
                url={avatarUrl} 
                alt={username || 'Avatar'}
                fallback={<span className="text-4xl font-bold">{avatarLetter}</span>}
                emojiClassName="text-5xl"
              />
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              
              {/* Username */}
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                <h2 className="text-2xl font-bold text-white">{profile?.username || 'Anonymous'}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                  Public
                </span>
              </div>

              {/* Email */}
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                <p className="text-gray-400">{user?.email}</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-700/50 text-gray-400 border border-gray-600/30">
                  Private
                </span>
              </div>

              {/* Role */}
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
                <p className="text-gray-400">{(profile as ProfileWithExtras | null)?.role || 'Student'} at UNILAK</p>
              </div>
            </div>
          </div>
            <div className="h-px bg-white/5 w-full" />

            <AccountStats joinedAt={user?.created_at} totalReviews={reviews.length} />
            
            {/* Actions */}
          <div className="pt-4 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            {/* Moderator Dashboard */}
            {((profile as ProfileWithExtras | null)?.role === 'moderator') && (
              <Link 
                href="/moderator"
                className="w-full md:w-auto bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                DASHBOARD
              </Link>
            )}

            {/* Edit Profile */}
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="w-full md:w-auto bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              EDIT PROFILE
            </button>

            {/* Sign Out */}
            <button 
              onClick={handleSignOut}
              className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3h-6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              SIGN OUT
            </button>

            {/* Delete Account */}
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              DELETE ACCOUNT
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <ConfirmModal
            title="Delete Account"
            message="Are you sure you want to delete your account? This action cannot be undone."
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteModal(false)}
            confirmText="DELETE ACCOUNT"
            isDestructive={true}
          />
        )}


        {showEditProfileModal && user && (
          <EditProfileModal
            userId={user.id}
            currentUsername={profile?.username || ''}
            currentAvatarUrl={(profile as ProfileWithExtras | null)?.avatar_url}
            onClose={() => setShowEditProfileModal(false)}
            onUpdate={() => router.refresh()}
          />
        )}
      </div>
    </div>
  );
}
