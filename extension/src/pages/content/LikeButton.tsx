import { useEffect, useState } from 'react';

import { supabase } from '@/helpers';
import useUser from '@/helpers/useUser';

export const LikeButton = ({ summaryId }) => {
  const [liked, setLiked] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !summaryId) return;

    const fetchLikes = async () => {
      try {
        const { data: likeData } = await supabase
          .from('summary_likes')
          .select('*')
          .eq('summary_id', summaryId)
          .eq('user_id', userId)
          .single();

        setLiked(!!likeData);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [summaryId, userId]);

  const handleLikeClick = async () => {
    if (!userId || !summaryId) return;

    if (liked) {
      await supabase
        .from('summary_likes')
        .delete()
        .eq('summary_id', summaryId)
        .eq('user_id', userId);
    } else {
      await supabase.from('summary_likes').insert({
        summary_id: summaryId,
        user_id: userId,
      });
    }

    setLiked((prev) => !prev);
  };

  return (
    <button onClick={handleLikeClick}>
      {liked ? 'Unlike' : 'Like'}
    </button>
  );
};
