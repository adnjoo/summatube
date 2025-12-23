import { NextRequest } from 'next/server';

import { summarizeTranscript } from '@/app/api/summarize/summarizeTranscript';

// Removed getYouTubeTranscript - server-side transcript fetching not supported

// OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Replace '*' with the Chrome extension origin for stricter security
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      error: 'Server-side transcript fetching has been removed. Please use client-side transcript fetching with the POST endpoint.'
    }),
    {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, video_id } = await request.json();

    if (!transcript || !video_id) {
      return new Response(
        JSON.stringify({ error: 'Missing transcript or video_id' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate summary from transcript
    const summaryContent = await summarizeTranscript(transcript);

    if (!summaryContent) {
      throw new Error('Failed to generate summary');
    }

    // Extract title from transcript
    const title = transcript.split(' ').slice(0, 10).join(' ') + '...';

    return new Response(
      JSON.stringify({
        title,
        summary: summaryContent,
        video_id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (err: any) {
    console.error('Error in POST /api/summarize:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate summary' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
