import { getTranscriptApi } from './transcriptClient';

export const fetchTranscript = async (video_id: string) => {
  const api = getTranscriptApi();
  // Optional: for cloud deployments where YouTube blocks datacenter IPs
  // const api = new YouTubeTranscriptApi('http://user:pass@residential-ip:port');

  try {
    const transcriptObj = await api.fetch(video_id, {
      languages: ['en'], // priority – falls back if needed
    });

    // Title not available via this package (it's transcript-only)
    // You can fetch title separately via youtubei.js getInfo if needed
    const title = 'Title fetching not supported in youtube-captions-api (transcript-only)';

    // Full transcript as array of text lines
    const transcript = transcriptObj.snippets.map((seg: any) => seg.text.trim());

    return { title, transcript };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};