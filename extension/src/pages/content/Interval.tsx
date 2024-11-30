import React from 'react';

interface IntervalProps {
  startTime: number;
  endTime: number;
  text: string;
  onClick: (time: number) => void;
}

const Interval: React.FC<IntervalProps> = ({
  startTime,
  endTime,
  text,
  onClick,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <p className='my-2 text-gray-800 dark:text-gray-300'>
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
