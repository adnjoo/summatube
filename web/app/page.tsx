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

export default async function Home() {
  // const { data, user } = await getData();
  return (
    <main className='flex flex-col py-4 sm:py-12'>
      <h1 className='text-center text-4xl font-bold'>SummaTube</h1>

      chrome extension coming
    </main>
  );
}
