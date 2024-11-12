import { useState, useEffect } from 'react';
import { FiThumbsUp } from 'react-icons/fi';
import { supabase } from '@/utils/supabase/client';

export type LikeButtonProps = {
  summaryId: string;
  userId: string;
};

export function LikeButton({ summaryId, userId }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: countData } = await supabase
        .from('summary_likes')
        .select('*', { count: 'exact' })
        .eq('summary_id', summaryId);

      const { data: likeData } = await supabase
        .from('summary_likes')
        .select('*')
        .eq('summary_id', summaryId)
        .eq('user_id', userId)
        .single();

      setLikeCount(countData?.length || 0);
      setLiked(!!likeData);
      console.log('likeData', likeData);
    };


    fetchLikes();
  }, [summaryId, userId]);

  const handleLikeClick = async () => {
    if (liked) {
      await supabase
        .from('summary_likes')
        .delete()
        .eq('summary_id', summaryId)
        .eq('user_id', userId);
      setLikeCount((prev) => prev - 1);
    } else {
      await supabase.from('summary_likes').insert({
        summary_id: summaryId,
        user_id: userId,
      });
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <button
      onClick={handleLikeClick}
      className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-700`}
      aria-label='Like'
    >
      <FiThumbsUp size={18} />
      <span className='ml-1'>{likeCount}</span>
    </button>
  );
}
