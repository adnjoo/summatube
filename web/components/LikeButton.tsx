import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (!userId) {
      setLoading(false); // If no user, no need to fetch data
      return;
    }

    const fetchLikes = async () => {
      setLoading(true); // Start loading
      try {
        const { data: countData, count } = await supabase
          .from('summary_likes')
          .select('*', { count: 'exact' })
          .eq('summary_id', summaryId);

        const { data: likeData } = await supabase
          .from('summary_likes')
          .select('*')
          .eq('summary_id', summaryId)
          .eq('user_id', userId)
          .single();

        setLikeCount(count || 0);
        setLiked(!!likeData);
      } catch (error) {
        console.error('Error fetching likes:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchLikes();
  }, [summaryId, userId]);

  const handleLikeClick = async () => {
    if (!userId || !summaryId) return; // Prevent liking if not logged in

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
    queryClient.invalidateQueries({
      queryKey: ['history'],
    }); // Invalidate the history query
  };

  if (loading) {
    // Render a skeleton loader or placeholder while loading
    return (
      <div
        className='flex animate-pulse items-center text-gray-300'
        aria-label='Loading'
      >
        <FiThumbsUp size={18} />
        <span className='ml-1'>-</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLikeClick}
      disabled={disabled || !userId} // Disable if no user or disabled prop is true
      className={`flex items-center ${
        liked ? 'text-red-500' : 'text-gray-500'
      } hover:text-red-700 ${
        disabled || !userId ? 'cursor-not-allowed opacity-50' : ''
      }`}
      aria-label='Like'
    >
      <FiThumbsUp size={18} />
      <span className='ml-1'>{likeCount}</span>
    </button>
  );
}
