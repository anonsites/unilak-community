'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import Avatar from './Avatar';

export type ResponseWithProfile = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  seen: boolean;
  profiles_table: { username: string | null; avatar_url: string | null; role: string | null } | null;
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  messages: ResponseWithProfile[];
  currentUserId: string;
  onSendMessage: (text: string) => Promise<void>;
  disableInput?: boolean;
}

export default function ChatModal({
  isOpen,
  onClose,
  user,
  messages,
  currentUserId,
  onSendMessage,
  disableInput = false,
}: ChatModalProps) {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [replyText]);

  const handleSend = async () => {
    if (!replyText.trim() || isSending) return;
    setIsSending(true);
    await onSendMessage(replyText);
    setReplyText('');
    setIsSending(false);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging on interactive elements in the header
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Check if it's a desktop view before enabling dragging
    if (!isDesktop) return;

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = 'none';
  }, [position, isDesktop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    }
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-end md:justify-end bg-black/60 md:bg-transparent md:p-0 md:pb-0 md:pr-4 animate-in fade-in duration-200 pointer-events-none">
      <div 
        ref={modalRef}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
        className="bg-[#1a1a1a] border-t-2 border-blue-500 md:border md:border-gray-700 w-full h-full md:h-[450px] md:max-w-md md:rounded-lg shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      >
        <div 
          onMouseDown={handleMouseDown}
          className="p-4 border-b border-white/5 flex justify-between items-center bg-[#111] md:cursor-move"
        >
          {user.username === 'Community responses' || user.username === 'Admin@UNILAK' ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-400">
                  <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
              </div>
              {user.username === 'Admin@UNILAK' ? (
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-white">{user.username}</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                </div>
              ) : (
                <h3 className="font-bold text-white">{user.username}</h3>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar
                url={user.avatarUrl}
                alt={user.username}
                fallback={<span className="text-xs font-bold">{user.username.charAt(0).toUpperCase()}</span>}
                imageClassName="w-8 h-8 rounded-full object-cover"
                emojiClassName="text-xl"
              />
              <h3 className="font-bold text-white">{user.username}</h3>
            </div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#161616] [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {messages.map((msg) => {
            const isSystem = msg.user_id === 'system';
            const isMod = msg.profiles_table?.role === 'moderator';
            const isMe = msg.user_id === currentUserId;
            const displayName = isMod ? 'Admin@UNILAK' : (msg.profiles_table?.username || 'User');
            
            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-3 px-4 animate-in fade-in duration-300">
                  <p className="text-xs text-gray-500 italic">
                    {msg.content}
                  </p>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="shrink-0">
                  <Avatar 
                    url={msg.profiles_table?.avatar_url} 
                    alt={displayName}
                    fallback={<span className="text-xs font-bold">{displayName.charAt(0).toUpperCase()}</span>}
                    imageClassName="w-8 h-8 rounded-full object-cover"
                    emojiClassName="text-xl"
                  />
                </div>
                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-400">{displayName}</span>
                    {isMod && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-500"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {!disableInput && (
          <div className="p-3 bg-[#111] border-t border-white/5 flex gap-2">
            <textarea ref={textareaRef} rows={1} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} disabled={isSending} />
            <button onClick={handleSend} disabled={!replyText.trim() || isSending} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg">
              {isSending ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" /></svg>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}