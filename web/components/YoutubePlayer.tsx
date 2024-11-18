'use client';

import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

import { useCheckMobile } from '@/lib/hooks';

interface YouTubePlayerProps {
  videoId: string;
  onReady: (player: any) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onReady,
}) => {
  const isMobile = useCheckMobile();
  const opts: YouTubeProps['opts'] = {
    height: isMobile ? '260' : '335',
    width: isMobile ? '427' : '550',
    playerVars: {
      autoplay: 0,
      controls: 1,
    },
  };

  const handleReady: YouTubeProps['onReady'] = (event) => {
    onReady(event.target);
  };

  return <YouTube videoId={videoId} opts={opts} onReady={handleReady} />;
};
