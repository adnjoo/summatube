import { NextRequest } from 'next/server';

import { fetchTranscriptWithTimestamps } from '@/app/api/summarize/fetchTranscriptWithTimestamps';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video_id = searchParams.get('video_id') as string;

  if (!video_id) {
    return new Response(
      JSON.stringify({ error: 'Missing video_id parameter' }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    // Fetch transcript grouped by 30-second intervals
    const groupedTranscript = await fetchTranscriptWithTimestamps(video_id);

    // console.log('Grouped transcript:', groupedTranscript);

    return new Response(
      JSON.stringify({
        video_id,
        intervals: groupedTranscript,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Allow all origins
          'Access-Control-Allow-Methods': 'GET', // Specify allowed methods
        },
      }
    );
  } catch (error) {
    console.error('Error fetching grouped transcript:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch grouped transcript' }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
}
