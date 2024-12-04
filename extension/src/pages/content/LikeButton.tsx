import { useEffect, useState } from 'react';
import { FiThumbsUp } from 'react-icons/fi';

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
          .maybeSingle();

        setLiked(!!likeData);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [summaryId, userId]);

  const handleLikeClick = async () => {
    if (!userId || !summaryId) return;

    try {
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
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      className={`flex items-center gap-2 rounded border px-4 py-2 transition ${
        liked ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      } hover:bg-blue-600 hover:text-white`}
    >
      <FiThumbsUp
        className={`${liked ? 'text-white' : 'text-gray-500'} transition`}
      />
    </button>
  );
};
