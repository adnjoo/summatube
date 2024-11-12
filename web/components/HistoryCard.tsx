import Link from 'next/link';
import { useState } from 'react';
import { FiShare2, FiTrash2 } from 'react-icons/fi';

import { Notification } from '@/components/layout/Notification';
import { Card } from '@/components/ui/card';
import { getThumbnail, getYouTubeURL } from '@/lib/helpers';
import { copyUrl, formatISOToHumanReadable } from '@/lib/helpers';
import { useCopyToClipboard } from '@/lib/hooks';

export type HistoryCardProps = {
  item: any;
  onDelete: () => void;
};

export function HistoryCard({ item, onDelete }: HistoryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { copySuccess, handleCopyClick } = useCopyToClipboard();

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsDeleting(true);
      onDelete();
    }
  };

  return (
    <Card className='flex w-full flex-col rounded-lg border border-gray-100 px-2 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:px-4 md:flex-row'>
      <div className='flex w-full flex-col md:w-64'>
        <Link
          href={getYouTubeURL({
            video_id: item.summaries.videos.video_id,
          })}
          className='text-sm font-semibold hover:underline'
          target='_blank'
        >
          {item.summaries.videos.title}
        </Link>
        <p className='text-sm text-gray-500'>
          {formatISOToHumanReadable(item.summaries.created_at)}
        </p>
        <img
          src={getThumbnail(item.summaries.videos.video_id)}
          alt={`${item.summaries.videos.title} thumbnail`}
          className='mt-2 h-auto w-full rounded-md md:w-64'
        />
      </div>
      <div className='mt-4 flex gap-4 sm:flex-col md:ml-4 md:mt-0'>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className='flex items-center text-red-500 hover:text-red-700'
          aria-label='Delete'
        >
          {isDeleting ? 'Deleting...' : <FiTrash2 size={18} />}
        </button>
        <button
          onClick={() =>
            handleCopyClick(copyUrl(item.summaries.videos.video_id))
          }
          className='flex items-center text-blue-500 hover:text-blue-700'
          aria-label='Copy URL'
        >
          <FiShare2 size={18} />
        </button>
      </div>
      <div className='ml-0 mt-4 w-full text-xs md:ml-4 md:mt-0'>
        <details className='md:hidden'>
          <summary className='cursor-pointer text-blue-600'>
            View Summary
          </summary>
          <p className='mt-2 text-gray-700'>{item.summaries.content}</p>
        </details>
        <p className='hidden text-gray-700 md:block'>
          {item.summaries.content}
        </p>
      </div>
      <Notification isVisible={copySuccess} />
    </Card>
  );
}
