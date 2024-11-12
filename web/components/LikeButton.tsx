import { useEffect, useState } from 'react';
import { FiThumbsUp } from 'react-icons/fi';

import { useUser } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { supabase } from '@/utils/supabase/client';

export type LikeButtonProps = {
  summaryId: string;
  className?: string;
};

/**
 * A button component that allows users to like a summary. It displays the total number of likes
 * and allows logged-in users to like or unlike the summary. Public (not logged-in) users can only view the like count.
 *
 * @component
 * @param {LikeButtonProps} props - The props for the component.
 * @returns {JSX.Element} A like button with like count display.
 */
export function LikeButton({ summaryId, className }: LikeButtonProps) {
  const user = useUser();
  const userId = user?.id;
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      if (userId) {
        // Fetch both the count and the user's like status if logged in
        const { data: countData, count } = await supabase
          .from('summary_likes')
          .select('*', { count: 'exact' })
          .eq('summary_id', summaryId);

        setLikeCount(count || 0);
        setLiked(!!countData?.find((like) => like.user_id === userId));
      } else {
        // Only fetch the like count if not logged in
        const { count } = await supabase
          .from('summary_likes')
          .select('*', { count: 'exact' })
          .eq('summary_id', summaryId);

        setLikeCount(count || 0);
      }
    };

    fetchLikes();
  }, [summaryId, userId]);

  const handleLikeClick = async () => {
    if (!userId) return;

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
      disabled={!userId}
      className={cn(
        'flex items-center',
        liked ? 'text-blue-500' : 'text-gray-500',
        !userId && 'cursor-not-allowed opacity-50',
        className
      )}
      aria-label='Like'
    >
      <FiThumbsUp size={18} />
      <span className='ml-1'>{likeCount}</span>
    </button>
  );
}
