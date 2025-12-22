'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Avatar from '@/components/Avatar';

interface Profile {
  id: string;
  username: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles_table')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data as Profile[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#535350] p-6 w-full">
      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-lg md:text-2xl font-bold tracking-wider uppercase">
          ALL COMMUNITY USERS
        </h1>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <Link
          href="/moderator" 
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors text-gray-300 hover:text-white flex-shrink-0"
          title="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-lg">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800 text-xs uppercase text-gray-400 border-b border-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">User</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">Role</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => {
                const username = user.username || 'Anonymous';
                const avatarLetter = username.startsWith('anon_')
                    ? (username.charAt(5) || username.charAt(0)).toUpperCase()
                    : username.charAt(0).toUpperCase();
                
                return (
                  <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border border-gray-700">
                          <Avatar 
                            url={user.avatar_url} 
                            alt={username}
                            fallback={<span className="text-lg font-bold text-gray-300">{avatarLetter}</span>}
                            imageClassName="w-full h-full object-cover"
                            emojiClassName="text-xl leading-none"
                          />
                        </div>
                        <span className="font-bold text-gray-200 truncate">{username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded ${
                        user.role === 'moderator' 
                          ? 'bg-purple-900/50 text-purple-400 border border-purple-800' 
                          : 'bg-blue-900/30 text-blue-400 border border-blue-800'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && filteredUsers.length === 0 && (
         <div className="text-center py-12 text-gray-500">No users found matching your search.</div>
      )}
    </div>
  );
}