import { useEffect, useState } from 'react';
import { FiThumbsUp } from 'react-icons/fi';

import { useUser } from '@/lib/hooks';
import { supabase } from '@/utils/supabase/client';

export type LikeButtonProps = {
  summaryId: string;
  disabled?: boolean;
};

export function LikeButton({ summaryId, disabled = false }: LikeButtonProps) {
  const user = useUser();
  const userId = user?.id;
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!userId) return; // Early exit if user is not logged in

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
    };

    fetchLikes();
  }, [summaryId, userId]);

  const handleLikeClick = async () => {
    if (!userId) return; // Prevent liking if not logged in

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
      disabled={disabled || !userId} // Disable if no user or disabled prop is true
      className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-700 ${disabled || !userId ? 'cursor-not-allowed opacity-50' : ''}`}
      aria-label='Like'
    >
      <FiThumbsUp size={18} />
      <span className='ml-1'>{likeCount}</span>
    </button>
  );
}
