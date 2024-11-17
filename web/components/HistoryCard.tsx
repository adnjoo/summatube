import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';

import { LikeButton } from '@/components/LikeButton';
import { Notification } from '@/components/layout/Notification';
import { Card } from '@/components/ui/card';
import { getThumbnail } from '@/lib/helpers';
import { formatISOToHumanReadable } from '@/lib/helpers';
import { useCopyToClipboard } from '@/lib/hooks';

export type HistoryCardProps = {
  item: any;
  onDelete: () => void;
};

export function HistoryCard({ item }: HistoryCardProps) {
  const { copySuccess, handleCopyClick } = useCopyToClipboard();

  return (
    <Card className='flex w-full flex-col rounded-lg border border-gray-100 px-2 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:px-4 md:flex-row'>
      <div className='flex w-full flex-col md:w-64'>
        <Link
          href={`/?v=${item.summaries.videos.video_id}`}
          className='text-sm font-semibold hover:underline'
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
        <LikeButton summaryId={item.summary_id} />
        <a
          href={`https://www.youtube.com/watch?v=${item.summaries.videos.video_id}`}
          className='flex items-center text-blue-500 hover:text-blue-700'
          aria-label='Open URL'
          target='_blank'
        >
          <FiExternalLink size={18} />
        </a>
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
