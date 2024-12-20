import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

import { fetchTranscript } from '@/app/api/summarize/fetchTranscript';
import { summarizeTranscript } from '@/app/api/summarize/summarizeTranscript';
import { createClient } from '@/utils/supabase/server';

async function getYouTubeTranscript(video_id: string) {
  if (!video_id) {
    throw new Error('Invalid video URL or missing video ID');
  }

  const { title, transcript } = await fetchTranscript(video_id);

  return {
    title: title || 'Title not available',
    transcript: transcript?.join(' ') || 'Transcript not available',
  };
}

// OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Replace '*' with the Chrome extension origin for stricter security
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video_id = searchParams.get('video_id') as string;
  const extension = searchParams.get('extension') === 'true';
  const save = searchParams.get('save') === 'true';
  const supabase = await createClient();
  let userId: string | null = null;

  if (!extension) {
    // Fetch the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userId = user ? user.id : null;
  } else {
    // Extract the user ID from the token
    const access_token = request.headers
      .get('Authorization')
      ?.split('Bearer ')[1];

    if (!access_token) {
      return new Response(JSON.stringify({ error: 'Missing access_token' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Supabase JWT Secret (keep this secure)
    const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

    // Verify the token
    const decodedToken = jwt.verify(access_token, JWT_SECRET);

    // console.log('Decoded Token:', decodedToken);

    userId = decodedToken['sub'];
  }

  try {
    // Step 1: Check if the video exists in `videos`; insert if it doesn’t
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('id, title')
      .eq('video_id', video_id)
      .single();

    let videoIdInDb = videoData?.id;

    if (!videoIdInDb) {
      const { title } = await getYouTubeTranscript(video_id);
      const { data: newVideo, error: insertVideoError } = await supabase
        .from('videos')
        .insert({ video_id, title })
        .select()
        .single();

      if (insertVideoError) throw insertVideoError;
      videoIdInDb = newVideo.id;
    }

    // Step 2: Check if a summary already exists for this video
    const { data: existingSummary, error: summaryError } = await supabase
      .from('summaries')
      .select('id, content, created_at')
      .eq('video_id', videoIdInDb)
      // .eq('user_id', userId) // Ensures user-specific summaries are checked
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // if (summaryError) throw summaryError;

    // Return existing summary if found
    if (existingSummary) {
      return new Response(
        JSON.stringify({
          title: videoData?.title,
          summary: existingSummary.content,
          id: existingSummary.id,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Step 3: Generate a new summary if not found
    const { title, transcript } = await getYouTubeTranscript(video_id);
    const summaryContent = await summarizeTranscript(transcript);

    // Step 4: Save the new summary in `summaries` if `save` is true
    let newSummary;

    const insertData = {
      video_id: videoIdInDb,
      user_id: userId || null,
      content: summaryContent,
    };

    const { data, error: insertError } = await supabase
      .from('summaries')
      .insert(insertData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error saving to summaries:', insertError);
    } else {
      newSummary = data;
    }

    // Return the newly generated summary
    return new Response(
      JSON.stringify({ title, summary: summaryContent, id: newSummary?.id }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (err) {
    console.error('Error processing summary:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to process summary' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
