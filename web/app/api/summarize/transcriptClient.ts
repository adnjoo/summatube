// lib/transcriptClient.ts
import YouTubeTranscriptApi from 'youtube-captions-api';

export const getTranscriptApi = () => {
  // On Vercel (datacenter IP) → use proxy
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
    const proxy = process.env.YOUTUBE_PROXY;
    if (!proxy) {
      console.warn('YOUTUBE_PROXY not set — requests may be blocked on Vercel');
    }
    return new YouTubeTranscriptApi(proxy);
  }
  // Local/residential IP → no proxy
  return new YouTubeTranscriptApi();
};