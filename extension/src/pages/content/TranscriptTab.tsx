import { Loader } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import Interval from '@/pages/content/Interval';

interface TranscriptTabProps {
  transcript: any[];
  transcriptLoading: boolean;
  currentTime: number;
  handleTimestampClick: (time: number) => void;
  isAutoScrollEnabled: boolean;
  activeRef: React.MutableRefObject<HTMLDivElement | null>;
}

const TranscriptTab: React.FC<TranscriptTabProps> = ({
  transcript,
  transcriptLoading,
  currentTime,
  handleTimestampClick,
  isAutoScrollEnabled,
  activeRef,
}) => {
  const getActiveTimestamp = () => {
    return transcript.find(
      (interval) =>
        currentTime >= interval.startTime && currentTime < interval.endTime
    );
  };

  const activeTimestamp = getActiveTimestamp();

  useEffect(() => {
    if (isAutoScrollEnabled && activeRef.current) {
      const container = document.getElementById('content-container');
      const activeElement = activeRef.current;

      if (container && activeElement) {
        const containerBounds = container.getBoundingClientRect();
        const activeBounds = activeElement.getBoundingClientRect();

        if (
          activeBounds.top < containerBounds.top ||
          activeBounds.bottom > containerBounds.bottom
        ) {
          container.scrollTo({
            top:
              activeElement.offsetTop -
              container.offsetTop -
              container.clientHeight / 2 +
              activeElement.clientHeight / 2,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentTime, isAutoScrollEnabled]);

  if (transcriptLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader size={48} className='animate-spin text-blue-500' />
      </div>
    );
  }

  if (!transcript.length) {
    return (
      <p className='text-gray-800 dark:text-gray-300'>
        No transcript available.
      </p>
    );
  }

  return (
    <div id='transcript-section' className='relative mt-4'>
      {transcript.map((interval, index) => (
        <div
          key={index}
          ref={
            activeTimestamp === interval
              ? (ref) => {
                  activeRef.current = ref;
                }
              : null
          }
          className={`rounded p-2 ${
            activeTimestamp === interval
              ? 'bg-blue-700 text-white' // Highlight the active section
              : 'hover:bg-gray-300 dark:hover:bg-gray-700' // Hover effect
          }`}
        >
          <Interval
            startTime={interval.startTime}
            endTime={interval.endTime}
            text={interval.text}
            onClick={handleTimestampClick}
            active={activeTimestamp === interval}
          />
        </div>
      ))}
    </div>
  );
};

export default TranscriptTab;
