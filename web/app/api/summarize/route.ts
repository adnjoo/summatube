import { NextRequest } from 'next/server';
import { summarizeTranscript } from '@/app/api/summarize/summarizeTranscript';

const MAX_TRANSCRIPT_LENGTH = 50000; // ~15 minutes of speech – safe for most LLMs

// Define CORS headers once to avoid repetition
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// CORS Preflight Handler
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Helper to extract transcript + video_id from GET or POST
async function extractParams(request: NextRequest): Promise<{ transcript: string | null; video_id: string | null }> {
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    return {
      transcript: searchParams.get('transcript'),
      video_id: searchParams.get('video_id'),
    };
  }

  // POST – parse JSON body
  try {
    const body = await request.json();
    return {
      transcript: body.transcript ?? null,
      video_id: body.video_id ?? null,
    };
  } catch {
    return { transcript: null, video_id: null };
  }
}

// Shared handler for GET and POST
async function handleSummarize(request: NextRequest) {
  const { transcript, video_id } = await extractParams(request);

  // Validation
  if (!transcript || !video_id) {
    return new Response(
      JSON.stringify({ error: 'Missing transcript or video_id' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  // Truncate very long transcripts (prevents token overflow / high cost)
  let processedTranscript = transcript;
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    processedTranscript = transcript.slice(0, MAX_TRANSCRIPT_LENGTH) + '\n\n... [transcript truncated for summary]';
  }

  try {
    const summaryContent = await summarizeTranscript(processedTranscript);

    if (!summaryContent?.trim()) {
      throw new Error('Empty summary returned from LLM');
    }

    // Improved title: use first full sentence if possible
    const sentences = processedTranscript.split(/[.!?]\s+/);
    const firstSentence = sentences[0] || '';
    const title = firstSentence
      ? firstSentence.slice(0, 100) + (firstSentence.length > 100 ? '...' : '')
      : processedTranscript.trim().split(/\s+/).slice(0, 12).join(' ') + '...';

    return new Response(
      JSON.stringify({
        title: title.trim(),
        summary: summaryContent.trim(),
        video_id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);

    return new Response(
      JSON.stringify({
        error: err.message || 'Failed to generate summary',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// Export both methods using the same handler
export { handleSummarize as GET };
export { handleSummarize as POST };