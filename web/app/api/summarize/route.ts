import { NextRequest } from 'next/server';
import { summarizeTranscript } from '@/app/api/summarize/summarizeTranscript';

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// GET: ?transcript=...&video_id=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transcript = searchParams.get('transcript');
  const video_id = searchParams.get('video_id');

  if (!transcript || !video_id) {
    return new Response(
      JSON.stringify({
        error: 'Missing required query parameters: transcript and video_id',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const summaryContent = await summarizeTranscript(transcript);

    if (!summaryContent) {
      throw new Error('Failed to generate summary');
    }

    // Simple title fallback from first few words
    const title = transcript.trim().split(/\s+/).slice(0, 10).join(' ') + '...';

    return new Response(
      JSON.stringify({
        title,
        summary: summaryContent,
        video_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in GET /api/summarize:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate summary' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// POST: body { transcript: string, video_id: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, video_id } = body;

    if (!transcript || !video_id) {
      return new Response(
        JSON.stringify({ error: 'Missing transcript or video_id in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const summaryContent = await summarizeTranscript(transcript);

    if (!summaryContent) {
      throw new Error('Failed to generate summary');
    }

    const title = transcript.trim().split(/\s+/).slice(0, 10).join(' ') + '...';

    return new Response(
      JSON.stringify({
        title,
        summary: summaryContent,
        video_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in POST /api/summarize:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate summary' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}