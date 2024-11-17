'use client';

import React, { useEffect, useState } from 'react';

interface Timestamp {
  startTime: number;
  endTime: number;
  text: string;
}

interface TimestampsPanelProps {
  videoId: string;
}

export const TimestampsPanel: React.FC<TimestampsPanelProps> = ({
  videoId,
}) => {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimestamps = async (video_id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/get-timestamps?video_id=${encodeURIComponent(video_id)}`
      );
      // if (!response.ok) {
      //   throw new Error('Failed to fetch timestamps');
      // }
      console.log('response', response);
      const data = await response.json();
      setTimestamps(data.intervals || []);
    } catch (error) {
      console.error('Error fetching timestamps:', error);
      setError('Failed to load timestamps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchTimestamps(videoId);
    }
  }, [videoId]);

  const handleSeek = (time: number) => {
    const player = document.querySelector('iframe'); // Assuming YouTube iframe
    if (player?.contentWindow) {
      player.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [time, true], // Seek to the timestamp
        }),
        '*'
      );
    }
  };

  if (loading) {
    return <div className='text-center'>Loading timestamps...</div>;
  }

  if (error) {
    return <div className='text-center text-red-500'>{error}</div>;
  }

  return (
    <div className='max-h-96 overflow-y-auto rounded-lg bg-gray-100 p-4 shadow-md'>
      <h3 className='mb-4 text-lg font-semibold'>Timestamps</h3>
      {timestamps.length === 0 ? (
        <div className='text-center text-gray-500'>No timestamps available</div>
      ) : (
        timestamps.map((timestamp, index) => (
          <div
            key={index}
            className='mb-4 cursor-pointer'
            onClick={() => handleSeek(timestamp.startTime)}
          >
            <div className='font-semibold text-blue-600'>
              {formatTime(timestamp.startTime)} -{' '}
              {formatTime(timestamp.endTime)}
            </div>
            <p className='text-sm text-gray-700'>{timestamp.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

// Helper function to format time in MM:SS
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
