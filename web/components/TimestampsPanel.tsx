'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Skeleton,
  Switch,
} from '@/components/ui';
import { formatTime } from '@/lib/helpers';

interface Timestamp {
  startTime: number;
  endTime: number;
  text: string;
}

interface TimestampsPanelProps {
  videoId: string;
  onSeek: (time: number) => void;
  currentTime: number;
  thumbnailTitle: string;
}

export const TimestampsPanel: React.FC<TimestampsPanelProps> = ({
  videoId,
  onSeek,
  currentTime,
  thumbnailTitle,
}) => {
  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
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
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentTime, isAutoScrollEnabled]);

  const getActiveTimestamp = () => {
    return timestamps.find(
      (timestamp) =>
        currentTime >= timestamp.startTime && currentTime < timestamp.endTime
    );
  };

  const downloadTimestampsAsTxt = () => {
    const header = `Timestamps for ${thumbnailTitle}\n\nsumma.tube/?v=${videoId}\n\n`;
    const content = timestamps
      .map(
        (timestamp) =>
          `[${formatTime(timestamp.startTime)} - ${formatTime(
            timestamp.endTime
          )}]\n${timestamp.text}`
      )
      .join('\n\n');

    const finalContent = header + content;

    const blob = new Blob([finalContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timestamps-${thumbnailTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeTimestamp = getActiveTimestamp();

  return (
    <Accordion type='single' collapsible defaultValue='timestamps'>
      <AccordionItem value='timestamps'>
        {/* Header */}
        <AccordionTrigger className='border-b px-4 py-2 text-lg font-semibold'>
          Timestamps
        </AccordionTrigger>

        {/* Content */}
        <AccordionContent className='max-h-64 overflow-y-auto p-4 md:max-h-96'>
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
              {/* Auto-Scroll Toggle */}
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm font-medium text-gray-700'>
                  Auto-Scroll
                </span>
                <Switch
                  checked={isAutoScrollEnabled}
                  onCheckedChange={setIsAutoScrollEnabled}
                />
              </div>

              {/* Download Button */}
              <div className='hidden py-2 md:block'>
                <button onClick={downloadTimestampsAsTxt}>
                  <FiDownload className='' />
                </button>
              </div>
              {timestamps.map((timestamp, index) => (
                <div
                  key={index}
                  ref={
                    activeTimestamp === timestamp
                      ? (ref) => {
                          activeRef.current = ref;
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
