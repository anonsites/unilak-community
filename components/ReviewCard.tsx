'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/lib/utils';
import { deleteReview } from '@/app/reviews/actions';
import ReportModal from './ReportModal';
import ConfirmModal from './ConfirmModal';
import Avatar from './Avatar';
import ReactionBar from './ReactionBar';
import { ReviewWithRelations } from '@/lib/types';

interface ReviewCardProps {
  review: ReviewWithRelations;
  showActions?: boolean;
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

export default function ReviewCard({ review, showActions = true, currentUserId, onDelete }: ReviewCardProps) {
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [viewCount, setViewCount] = useState(review.view_count || 0);
  
  // Track view on component mount
  useEffect(() => {
    const trackView = async () => {
      try {
        const sessionKey = `review_viewed_${review.id}`;
        
        // Check if already viewed in this session
        if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
          const response = await fetch(`/api/reviews/${review.id}/view`, {
            method: 'POST',
          });
          
          if (response.ok) {
            const data = await response.json();
            setViewCount(data.view_count);
            sessionStorage.setItem(sessionKey, 'true');
          }
        } else {
          // Already viewed in session, just use current count
          setViewCount(review.view_count || 0);
        }
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };
    
    trackView();
  }, [review.id, review.view_count]);



  const username = review.profiles_table?.username || 'Anonymous';
  const avatarLetter = username.startsWith('anon_')
    ? (username.charAt(5) || username.charAt(0)).toUpperCase()
    : username.charAt(0).toUpperCase();

  const isOwner = currentUserId && currentUserId === review.user_id;

  const MAX_LENGTH = 300;
  const shouldTruncate = review.content.length > MAX_LENGTH;

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportModal(true);
  };

  const toggleReportMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportMenu(!showReportMenu);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      if (onDelete) {
        onDelete(review.id);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert('Failed to delete review');
      setIsDeleting(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/reviews/${review.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className={`p-5 rounded-lg border transition-colors bg-gray-900 group relative h-full flex flex-col cursor-default`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3 mb-4 relative z-10">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden shrink-0 border border-gray-600 mt-1">
          <Avatar 
            url={review.profiles_table?.avatar_url} 
            alt={username}
            fallback={<span className="text-lg font-bold text-gray-300">{avatarLetter}</span>}
            imageClassName="w-full h-full object-cover"
            emojiClassName="text-xl leading-none"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-200">
              {username}
            </span>
            {showActions && (
              <div className="ml-auto flex items-center gap-1 relative z-10">
                <button
                  onClick={handleShareClick}
                  className="text-white/80 hover:text-blue-400 px-2 py-1 rounded hover:bg-white/90 transition-colors"
                  title="Copy Link"
                >
                  {isCopied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  )}
                </button>
                {isOwner ? (
                  <>
              <Link
                href={`/reviews/edit/${review.id}`}
                className="text-blue-500 hover:text-blue-400 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                title="Edit Review"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </Link>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                title="Delete Review"
              >
                {isDeleting ? '...' : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                )}
              </button>
                  </>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={toggleReportMenu}
                      className="text-gray-600 hover:text-gray-400 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                      title="More options"
                    >
                      •••
                    </button>
                    {showReportMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowReportMenu(false); }} />
                        <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded shadow-lg border border-gray-700 z-50 overflow-hidden">
                          <button
                            onClick={(e) => {
                              setShowReportMenu(false);
                              handleReportClick(e);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            Report this review
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Context Line */}
          <p className="text-lg text-gray-500 mt-0.5">
            is talking about <span className="text-gray-400">{review.topics_table?.name}</span> in UNILAK
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="mb-8 grow">
        <div className="relative">
          <p className="text-white text-lg whitespace-pre-wrap leading-relaxed font-medium">
            {isExpanded || !shouldTruncate ? review.content : `${review.content.slice(0, MAX_LENGTH)}...`}
          </p>
          {!isExpanded && shouldTruncate && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>
        {shouldTruncate && (
          <span
            role="button"
            onClick={toggleExpand}
            className="text-blue-400 hover:text-blue-300 text-xs font-bold mt-2 uppercase tracking-wide cursor-pointer block w-fit opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </span>
        )}
      </div>

      {/* Recommendation */}
      {review.recommendation && (
        <div className="mb-6">
          <span className="text-lg text-gray-500 font-bold uppercase mr-2">TODO:</span>
          <span className="text-lg text-gray-400 italic">{review.recommendation}</span>
        </div>
      )}

      {/* Reactions */}
      <div className="mb-8 pb-4">
        <ReactionBar
          review={review}
          currentUserId={currentUserId}
          onReactionsChange={() => {
            // Optional: Update parent component if needed
          }}
        />
      </div>

      {/* Time - Bottom Right */}
      <div className="absolute bottom-4 right-4 text-sm text-white/80 flex items-center gap-3">
        {/* View Count with Eye Icon */}
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.107.424.107.639a1.012 1.012 0 0 1-.1.639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178a1.02 1.02 0 0 1-.037-.639Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span>{viewCount}</span>
        </div>

        {/* Subtopic and Time */}
        <div>
          {review.subtopics_table?.name && (
            <span className="mr-1">{review.subtopics_table.name},</span>
          )}
          {review.created_at ? timeAgo(review.created_at) : 'Just now'}
        </div>
      </div>

      {showReportModal && (
        <ReportModal reviewId={review.id} onClose={() => setShowReportModal(false)} />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Review?"
          message="Are you sure you want to delete this review? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="DELETE"
          isDestructive={true}
        />
      )}
    </div>
  );
}