import { Suspense } from 'react';

import LandingBody from '@/app/(landing)/LandingBody';
import { getThumbnail, getYouTubeURL } from '@/lib/helpers';
import { createClient } from '@/utils/supabase/server';

export type Example = {
  thumbnail: string;
  title: string;
  video_id: string;
};

async function getData(): Promise<any> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the latest 5 summaries (only URLs) from Supabase
  const { data, error } = await supabase
    .from('history')
    .select('video_id, title')
    .order('created_at', { ascending: false })
    .limit(7);

  if (error) {
    console.error('Error fetching summaries:', error);
    return [];
  }
  // Map the data to include URLs and thumbnails
  const mappedData = data.map(({ video_id, title }) => ({
    url: getYouTubeURL(video_id),
    thumbnail: getThumbnail(video_id),
    title,
    video_id,
  }));

  return {
    user,
    data: mappedData,
  };
}

export default async function Home() {
  const { data, user } = await getData();
  return (
    <main className='flex flex-col py-4 sm:py-24'>
      <h1 className='text-center text-4xl font-bold'>SummaTube</h1>

      {!user && (
        <>
          <p className='mx-auto mt-4 max-w-2xl text-center text-lg'>
            SummaTube helps users to quickly access summaries of trending
            YouTube videos, making it easy to stay informed.
          </p>
        </>
      )}

      <Suspense fallback={null}>
        <LandingBody examples={data} />
      </Suspense>
    </main>
  );
}
