import { useState, useEffect } from 'react';
import { FiExternalLink, FiShare2, FiThumbsUp } from 'react-icons/fi';

import { Notification } from '@/components/layout/Notification';
import { copyUrl } from '@/lib/helpers';
import { useCopyToClipboard } from '@/lib/hooks';
import { supabase } from '@/utils/supabase/client';

export type SummaryCardProps = {
  summary: any;
  loading: boolean;
  video_id: string;
  user_id: string;
};

export const SummaryCard = ({ summary, loading, video_id, user_id }) => {
  
  const { copySuccess, handleCopyClick } = useCopyToClipboard();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // Fetch like count and whether the user has liked this summary
  useEffect(() => {
    const fetchLikes = async () => {
      const { data: countData } = await supabase
        .from('summary_likes')
        .select('*', { count: 'exact' })
        .eq('summary_id', summary?.id);

      const { data: likeData } = await supabase
        .from('summary_likes')
        .select('*')
        .eq('summary_id', summary?.id)
        .eq('user_id', user_id)
        .single();

      setLikeCount(countData?.length || 0);
      setLiked(!!likeData);
    };

    fetchLikes();
  }, [summary?.id, user_id]);

  // Handle like/unlike functionality
  const handleLikeClick = async () => {
    if (liked) {
      await supabase
        .from('summary_likes')
        .delete()
        .eq('summary_id', summary?.id)
        .eq('user_id', user_id);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase.from('summary_likes').insert({
        summary_id: summary?.id,
        user_id,
      });
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  if (!summary || loading) return null;

  return (
    <div className='mx-auto mt-8 max-w-5xl rounded border border-gray-300 p-2 text-sm sm:p-4 sm:text-base'>
      <h2 className='mb-2 text-xl'>Summary</h2>
      <div>
        <div className='flex flex-row items-center'>
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
          <button
            onClick={handleLikeClick}
            className={`ml-4 flex items-center ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-700`}
            aria-label='Like'
          >
            <FiThumbsUp size={18} />
            <span className='ml-1'>{likeCount}</span>
          </button>
        </div>
        <p>{summary?.summary}</p>
      </div>
      <Notification isVisible={copySuccess} />
    </div>
  );
};
