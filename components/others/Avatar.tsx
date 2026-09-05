import React from 'react';

interface AvatarProps {
  url?: string | null;
  alt?: string;
  fallback: React.ReactNode;
  imageClassName?: string;
  emojiClassName?: string;
}

export default function Avatar({ 
  url, 
  alt = 'Avatar', 
  fallback, 
  imageClassName = "w-full h-full object-cover",
  emojiClassName = "text-2xl"
}: AvatarProps) {
  const isImage = url?.startsWith('http');

  if (isImage && url) {
    return <img src={url} alt={alt} className={imageClassName} />;
  }

  if (url) {
    return <span className={emojiClassName}>{url}</span>;
  }

  return <>{fallback}</>;
}