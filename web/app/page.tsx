import { Suspense } from 'react';

import LandingBody from '@/app/LandingBody';
import { getThumbnail, getYouTubeURL } from '@/lib/helpers';
import { createClient } from '@/utils/supabase/server';

export type Example = {
  thumbnail: string;
  title: string;
  video_id: string;
  id: string;
};

async function getData(): Promise<any> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Step 1: Fetch the latest 7 videos
  const { data: videos, error: videoError } = await supabase
    .from('videos')
    .select('id, video_id, title')
    .order('created_at', { ascending: false })
    .limit(7);

  if (videoError) {
    console.error('Error fetching videos:', videoError);
    return [];
  }

  // Map the data to include URLs and thumbnails
  const mappedData = videos.map(
    ({ video_id, title }) => ({
      url: getYouTubeURL({ video_id }),
      thumbnail: getThumbnail(video_id),
      title: title || 'Title not available',
      video_id,
    })
  );

  return {
    user,
    data: mappedData,
  };
}

export default async function Home() {
  const { data, user } = await getData();
  return (
    <main className='flex flex-col py-4 sm:py-12'>
      <h1 className='text-center text-4xl font-bold'>SummaTube</h1>

      {/* {!user && (
        <>
          <p className='mx-auto mt-4 max-w-2xl text-center text-lg'>
            SummaTube leverages AI to provide users with quick access to summaries of trending
            YouTube videos, making it easy to stay informed.
          </p>
        </>
      )} */}

      <Suspense fallback={null}>
        <LandingBody examples={data} />
      </Suspense>
    </main>
  );
}
