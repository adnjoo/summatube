import React from 'react';

import { cn } from '@/helpers/cn';

interface IntervalProps {
  startTime: number;
  endTime: number;
  text: string;
  onClick: (time: number) => void;
  active: boolean;
}

const Interval: React.FC<IntervalProps> = ({
  startTime,
  endTime,
  text,
  onClick,
  active,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <p
      className={cn(
        'my-2 text-gray-800 dark:text-gray-300',
        active ? '!text-white' : ''
      )}
    >
      <button
        className='text-blue-500 hover:underline'
        onClick={() => onClick(startTime)}
      >
        {formatTime(startTime)} - {formatTime(endTime)}
      </button>
      : {text}
    </p>
  );
};

export default Interval;
