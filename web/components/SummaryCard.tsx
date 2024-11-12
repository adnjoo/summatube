import { FiExternalLink, FiShare2 } from 'react-icons/fi';

import { LikeButton } from '@/components/LikeButton';
import { Notification } from '@/components/layout/Notification';
import { copyUrl } from '@/lib/helpers';
import { useCopyToClipboard } from '@/lib/hooks';

export type SummaryCardProps = {
  summary: any;
  loading: boolean;
  video_id: string;
};

export const SummaryCard = ({ summary, loading, video_id }) => {
  const { copySuccess, handleCopyClick } = useCopyToClipboard();

  if (!summary || loading) return null;

  return (
    <div className='mx-auto mt-8 max-w-5xl rounded border border-gray-300 p-2 text-sm sm:p-4 sm:text-base'>
      <h2 className='mb-2 text-xl'>Summary</h2>
      <div>
        <div className='flex flex-row items-center gap-2'>
          <button
            onClick={() => handleCopyClick(copyUrl(video_id))}
            className='my-2 text-blue-500 hover:text-blue-700'
            aria-label='Copy URL'
          >
            <FiShare2 size={18} />
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${video_id}`}
            target='_blank'
            rel='noopener noreferrer'
            className='ml-2 text-blue-500 hover:text-blue-700'
          >
            <FiExternalLink size={18} />
          </a>
          <LikeButton
            summaryId={summary.id}
          />
        </div>
        <p>{summary?.summary}</p>
      </div>
      <Notification isVisible={copySuccess} />
    </div>
  );
};
