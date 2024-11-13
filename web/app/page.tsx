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

  // Step 2: For each video, fetch the latest summary separately
  const videoSummaries = await Promise.all(
    videos.map(async (video) => {
      const { data: latestSummary, error: summaryError } = await supabase
        .from('summaries')
        .select('id, content, created_at')
        .eq('video_id', video.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (summaryError) {
        console.error(
          `Error fetching summary for video ${video.video_id}:`,
          summaryError
        );
        return {
          ...video,
          summary: null,
          summary_id: null,
          summary_created_at: null,
        };
      }

      return {
        ...video,
        summary: latestSummary?.content || 'No summary available',
        summary_id: latestSummary?.id,
        summary_created_at: latestSummary?.created_at,
      };
    })
  );

  // Map the data to include URLs and thumbnails
  const mappedData = videoSummaries.map(
    ({ video_id, title, summary, summary_id, summary_created_at }) => ({
      url: getYouTubeURL({ video_id }),
      thumbnail: getThumbnail(video_id),
      title: title || 'Title not available',
      video_id,
      id: summary_id,
      summary,
      created_at: summary_created_at,
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
