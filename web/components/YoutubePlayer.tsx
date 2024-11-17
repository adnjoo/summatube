'use client';

import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface YouTubePlayerProps {
  videoId: string;
  onReady: (player: any) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onReady,
}) => {
  const opts: YouTubeProps['opts'] = {
    height: '260',
    width: '427',
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
