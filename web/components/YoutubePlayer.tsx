'use client';

import React from 'react';

interface YouTubePlayerProps {
  embedUrl: string;
  title?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  embedUrl,
  title,
}) => {
  if (!embedUrl) return null;

  return (
    <div className='mx-auto mt-4 flex h-full w-full flex-col items-center sm:max-w-xl'>
      <h3 className='sr-only mb-2 text-lg'>Embed</h3>
      <iframe
        src={embedUrl}
        title='YouTube Embed'
        className='aspect-video h-auto w-full rounded'
        allowFullScreen
      />
      {title && <div className='mt-1 text-center text-xs'>{title}</div>}
    </div>
  );
};
