import { type Example } from '@/app/(landing)/page';
import { LikeButton } from '@/components/LikeButton';

export type MarqueeCardProps = {
  example: Example;
  handleThumbnailClick: any;
};

export const MarqueeCard = ({
  example,
  handleThumbnailClick,
}: MarqueeCardProps) => {
  return (
    <div
      key={example.video_id + example.id}
      className='group relative cursor-pointer'
      onClick={() => handleThumbnailClick(example.video_id, example.title)}
    >
      <img
        className='z-50 max-w-[120px] cursor-pointer rounded-sm shadow-md sm:max-w-[180px]'
        src={example.thumbnail}
        alt='thumbnail'
      />
      <div className='absolute bottom-0 left-0 z-0 w-full bg-black bg-opacity-75 p-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
        {example.title}
      </div>

      {/* LikeButton overlay in the top-right corner */}
      <div className='absolute right-2 top-2'>
        <LikeButton
          summaryId={example.id}
          className='rounded-full bg-white p-1 shadow-lg'
        />
      </div>
    </div>
  );
};
