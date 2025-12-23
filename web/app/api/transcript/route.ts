import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video_id = searchParams.get('video_id');

  if (!video_id) {
    return new Response(
      JSON.stringify({ error: 'Missing video_id parameter' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Fetch YouTube watch page
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${video_id}&hl=en`);
    if (!pageRes.ok) {
      throw new Error(`Failed to load video page: ${pageRes.status}`);
    }

    const html = await pageRes.text();

    // Extract player response
    const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!match) {
      throw new Error('Player response not found');
    }

    const playerResponse = JSON.parse(match[1]);

    // Get video title
    const title = playerResponse.videoDetails?.title || 'Unknown Title';

    // Get captions
    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks?.length) {
      throw new Error('No captions available');
    }

    let track = captionTracks.find((t: any) => t.languageCode === 'en' && t.kind !== 'asr') ||
                captionTracks.find((t: any) => t.languageCode === 'en');

    if (!track) {
      throw new Error('English captions not available');
    }

    let captionUrl = track.baseUrl.replace(/&fmt=srv\d*/g, '').replace(/&fmt=\w+$/, '');

    // Fetch transcript XML
    const captionRes = await fetch(captionUrl);
    if (!captionRes.ok) {
      throw new Error('Failed to fetch captions');
    }

    const xml = await captionRes.text();

    if (!xml.includes('<text')) {
      throw new Error('Empty transcript');
    }

    // Parse segments
    const regex = /<text start="([^"]+)" dur="([^"]+)">([^<]+)<\/text>/g;
    const segments: { text: string; start: number }[] = [];
    let m;

    while ((m = regex.exec(xml)) !== null) {
      segments.push({
        text: m[3].replace(/&amp;#39;/g, "'").trim(),
        start: parseFloat(m[1]),
      });
    }

    if (segments.length === 0) {
      throw new Error('No transcript segments');
    }

    // Group into 30s chunks
    const grouped = segments.reduce((acc: any, seg) => {
      const idx = Math.floor(seg.start / 30);
      if (!acc[idx]) acc[idx] = { startTime: idx * 30, endTime: (idx + 1) * 30, text: [] };
      acc[idx].text.push(seg.text);
      return acc;
    }, {});

    const chunks = Object.values(grouped).map((g: any) => ({
      startTime: g.startTime,
      endTime: g.endTime,
      text: g.text.join(' ').replace(/\s+/g, ' ').trim(),
    }));

    return new Response(
      JSON.stringify({
        title,
        chunks,
        fullTranscript: segments.map(s => s.text).join(' '),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error: any) {
    console.error('Transcript API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch transcript' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
