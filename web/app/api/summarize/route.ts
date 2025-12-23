import { NextRequest } from 'next/server';
import { summarizeTranscript } from '@/app/api/summarize/summarizeTranscript';

const MAX_TRANSCRIPT_LENGTH = 50000; // ~15 minutes of speech – safe for most LLMs

// Helper to extract and validate transcript + video_id from either GET or POST
function extractParams(request: NextRequest) {
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    const transcript = searchParams.get('transcript');
    const video_id = searchParams.get('video_id');
    return { transcript, video_id };
  }

  // POST
  return request.json().then(body => ({
    transcript: body.transcript,
    video_id: body.video_id,
  }));
}

// CORS Preflight
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

// Shared handler logic for both GET and POST
async function handleSummarize(request: NextRequest) {
  let transcript: string | null = null;
  let video_id: string | null = null;

  try {
    const params = await extractParams(request);
    transcript = params.transcript;
    video_id = params.video_id;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  if (!transcript || !video_id) {
    return new Response(
      JSON.stringify({ error: 'Missing transcript or video_id' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  // Optional: Truncate very long transcripts to avoid token limits / high cost
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    transcript = transcript.slice(0, MAX_TRANSCRIPT_LENGTH) + '\n\n... [transcript truncated for summary]';
  }

  try {
    const summaryContent = await summarizeTranscript(transcript);

    if (!summaryContent) {
      throw new Error('Empty summary returned from LLM');
    }

    // Better title: first sentence or first 10 words
    const firstSentence = transcript.split(/[.!?]\s+/)[0];
    const title = firstSentence
      ? firstSentence.slice(0, 80) + (firstSentence.length > 80 ? '...' : '')
      : transcript.trim().split(/\s+/).slice(0, 10).join(' ') + '...';

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
    console.error('Error in /api/summarize:', err);
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

// Now both GET and POST use the same logic
export { handleSummarize as GET };
export { handleSummarize as POST };