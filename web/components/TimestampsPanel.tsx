'use client';

import React, { useEffect, useRef, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

interface Timestamp {
  startTime: number;
  endTime: number;
  text: string;
}

interface TimestampsPanelProps {
  videoId: string;
  onSeek: (time: number) => void;
  currentTime: number; // Add a prop to pass the current video time
}

export const TimestampsPanel: React.FC<TimestampsPanelProps> = ({
  videoId,
  onSeek,
  currentTime,
}) => {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false); // Auto-scroll state
  const activeRef = useRef<HTMLDivElement | null>(null);

  const fetchTimestamps = async (video_id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/get-timestamps?video_id=${encodeURIComponent(video_id)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch timestamps: ${response.statusText}`);
      }
      const data = await response.json();
      setTimestamps(data.intervals || []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load timestamps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchTimestamps(videoId);
  }, [videoId]);

  useEffect(() => {
    if (isAutoScrollEnabled && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, isAutoScrollEnabled]);

  const getActiveTimestamp = () => {
    return timestamps.find(
      (timestamp) =>
        currentTime >= timestamp.startTime && currentTime < timestamp.endTime
    );
  };

  const activeTimestamp = getActiveTimestamp();

  return (
    <Accordion type='single' collapsible defaultValue='timestamps'>
      <AccordionItem value='timestamps'>
        {/* Header */}
        <AccordionTrigger className='border-b px-4 py-2 text-lg font-semibold'>
          Timestamps
        </AccordionTrigger>

        {/* Auto-Scroll Toggle */}
        <div className='flex items-center justify-between px-4 py-2'>
          <span className='text-sm font-medium text-gray-700'>Auto-Scroll</span>
          <Switch
            checked={isAutoScrollEnabled}
            onCheckedChange={setIsAutoScrollEnabled}
          />
        </div>

        {/* Content */}
        <AccordionContent className='max-h-64 overflow-y-auto p-4'>
          {loading ? (
            <>
              <Skeleton className='mb-4 h-6 w-full' />
              <Skeleton className='mb-4 h-6 w-3/4' />
              <Skeleton className='h-6 w-1/2' />
            </>
          ) : error ? (
            <div className='text-red-500'>{error}</div>
          ) : timestamps.length === 0 ? (
            <div className='text-gray-500'>No timestamps available.</div>
          ) : (
            <div>
              {timestamps.map((timestamp, index) => (
                <div
                  key={index}
                  ref={
                    activeTimestamp === timestamp
                      ? (ref) => {
                          activeRef.current = ref; // Just assign, do not return
                        }
                      : null
                  }
                  className={`mb-4 rounded p-2 ${
                    activeTimestamp === timestamp
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    className='cursor-pointer font-semibold text-blue-600 hover:underline'
                    onClick={() => onSeek(timestamp.startTime)}
                  >
                    {formatTime(timestamp.startTime)} -{' '}
                    {formatTime(timestamp.endTime)}
                  </button>
                  <p className='text-sm text-gray-700'>{timestamp.text}</p>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// Helper function to format time in MM:SS
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};
