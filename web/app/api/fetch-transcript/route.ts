import { NextRequest } from 'next/server';
import { fetchTranscript } from '@/app/api/summarize/fetchTranscript';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const video_id = body.video_id;

    if (!video_id) {
      return new Response(JSON.stringify({ error: 'Missing video_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { title, transcript } = await fetchTranscript(video_id);

    // transcript is array of lines; join and also create 30s chunks
    const fullText = Array.isArray(transcript) ? transcript.join(' ') : String(transcript || '');

    // Very small chunking: split by 30s placeholder index since youtube-captions-api returns snippets without timing
    // We return fullText and leave fine-grained timestamps to client/player if needed.
    return new Response(
      JSON.stringify({ title, transcript: fullText }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err: any) {
    console.error('fetch-transcript error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch transcript' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
