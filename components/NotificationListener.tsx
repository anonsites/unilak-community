'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function NotificationListener() {
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Request browser notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('request_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcement_requests_table' },
        () => {
          // Play notification sound
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch((e) => console.error('Audio play failed', e));

          toast('New Announcement Request!', {
            icon: '🔔',
            style: {
              borderRadius: '10px',
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
            duration: 5000,
          });

          // Show browser notification if user is in another tab
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('New Announcement Request', {
              body: 'A new announcement request has been submitted.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return null;
}