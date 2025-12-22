'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

interface Review {
  id: string
  content: string
  recommendation: string | null
  type: 'positive' | 'negative'
  created_at: string
  profiles_table: { username: string; avatar_url: string | null } | null
  topics_table: { name: string } | null
  subtopics_table: { name: string } | null
}

function ReviewCard({ review, onDelete }: { review: Review; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.content.length > 150
  const username = review.profiles_table?.username || 'Unknown'
  const avatarLetter = username.startsWith('anon_')
    ? (username.charAt(5) || username.charAt(0)).toUpperCase()
    : username.charAt(0).toUpperCase()

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow border border-gray-800 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
            review.type === 'positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {review.type}
          </span>
          <span className="text-sm text-gray-400">
            {review.topics_table?.name} / {review.subtopics_table?.name}
          </span>
        </div>
        <button
          onClick={() => onDelete(review.id)}
          className="text-red-500 hover:text-red-400 text-sm font-medium"
        >
          Delete
        </button>
      </div>

      <div className="text-gray-300 mb-3 whitespace-pre-wrap flex-grow">
        {expanded || !isLong ? review.content : `${review.content.slice(0, 150)}...`}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-400 hover:underline ml-1 text-sm font-medium"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      
      {review.recommendation && (
        <div className="bg-blue-900/20 p-3 rounded text-sm text-blue-300 border border-blue-500/20 mb-3">
          <strong>Recommendation:</strong> {review.recommendation}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 border-t border-gray-800 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
            <Avatar 
              url={review.profiles_table?.avatar_url} 
              alt={username}
              fallback={<span className="text-xs font-bold text-gray-500">{avatarLetter}</span>}
              imageClassName="w-full h-full object-cover"
              emojiClassName="text-lg leading-none"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">@{username}</span>
        </div>
        <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  const [supabase] = useState(() => createClient())
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('reviews_table')
        .select('*, profiles_table(username, avatar_url), topics_table(name), subtopics_table(name)')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching reviews:', error)
      } else {
        setReviews((data as unknown as Review[]) || [])
      }
      setLoading(false)
    }

    fetchReviews()
  }, [supabase, refreshKey])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    
    const { error } = await supabase
      .from('reviews_table')
      .delete()
      .eq('id', deleteId)

    if (error) {
      showToast('Error deleting review', 'error')
      console.error(error)
    } else {
      setReviews((prev) => prev.filter((r) => r.id !== deleteId))
      showToast('Review deleted successfully', 'success')
    }
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-[#535350] p-6 w-full">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
            <h3 className="text-lg font-bold text-white mb-2">Delete Review?</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-900/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 text-white p-4 md:p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center gap-4">
        <h1 className="text-lg md:text-2xl font-bold tracking-wider">MANAGE REVIEWS</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)} 
            disabled={loading}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors text-gray-300 hover:text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh List"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>

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
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No reviews found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}