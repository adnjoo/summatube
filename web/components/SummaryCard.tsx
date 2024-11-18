import { Loader2 } from 'lucide-react';
import { FiExternalLink, FiShare2 } from 'react-icons/fi';

import { LikeButton } from '@/components/LikeButton';
import { Notification } from '@/components/layout/Notification';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { copyUrl } from '@/lib/helpers';
import { useCopyToClipboard } from '@/lib/hooks';

export type SummaryCardProps = {
  summary: any;
  loading: boolean;
  video_id: string;
};

export const SummaryCard = ({
  summary,
  loading,
  video_id,
}: SummaryCardProps) => {
  const { copySuccess, handleCopyClick } = useCopyToClipboard();

  return (
    <Accordion type='single' collapsible defaultValue='summary'>
      <AccordionItem value='summary'>
        {/* Accordion Trigger */}
        <AccordionTrigger className='border-b px-4 py-2 text-lg font-semibold'>
          Summary
        </AccordionTrigger>

        {/* Accordion Content */}
        <AccordionContent className='p-4'>
          {loading ? (
            <div className='flex items-center justify-center'>
              <Loader2 size={32} className='animate-spin' />
            </div>
          ) : (
            <>
              {/* Actions */}
              <div className='mb-4 flex flex-row items-center gap-2'>
                {/* Share Button */}
                <button
                  onClick={() => handleCopyClick(copyUrl(video_id))}
                  className='text-blue-500 hover:text-blue-700'
                  aria-label='Copy URL'
                >
                  <FiShare2 size={18} />
                </button>
                {/* External Link */}
                <a
                  href={`https://www.youtube.com/watch?v=${video_id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-2 text-blue-500 hover:text-blue-700'
                >
                  <FiExternalLink size={18} />
                </a>
                {/* Like Button */}
                <LikeButton summaryId={summary?.id} />
              </div>
              {/* Summary Text */}
              <p className='text-gray-700'>
                {summary?.summary || 'No summary available.'}
              </p>
              {/* Notification */}
            </>
          )}
          <Notification isVisible={copySuccess} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
