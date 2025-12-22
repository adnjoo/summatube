import { getTranscriptApi } from './transcriptClient';

export const fetchTranscriptWithTimestamps = async (video_id: string) => {
  const api = getTranscriptApi();
  // Optional: for cloud deployments
  // const api = new YouTubeTranscriptApi('http://user:pass@residential-ip:port');

  try {
    const transcript = await api.fetch(video_id, {
      languages: ['en'], // You can add more fallbacks: ['en', 'en-GB']
    });

    // Raw timed segments (start/duration in seconds)
    const segments = transcript.snippets.map((seg) => ({
      start_ms: Math.round(seg.start * 1000),
      end_ms: Math.round((seg.start + seg.duration) * 1000),
      snippet: seg.text.trim(),
      start_time_text: formatTime(seg.start), // Helper below
    }));

    // Group by 30-second intervals (same logic as your original code)
    const groupedByInterval = segments.reduce((acc: any[], segment: any) => {
      const startTimeSec = segment.start_ms / 1000;
      const intervalIndex = Math.floor(startTimeSec / 30);

      if (!acc[intervalIndex]) {
        acc[intervalIndex] = {
          startTime: intervalIndex * 30,
          endTime: (intervalIndex + 1) * 30,
          text: [],
        };
      }

      acc[intervalIndex].text.push(segment.snippet);

      return acc;
    }, []);

    // Convert to clean array
    return Object.values(groupedByInterval).map((interval: any) => ({
      startTime: interval.startTime,
      endTime: interval.endTime,
      text: interval.text.join(' ').replace(/\s+/g, ' ').trim(),
    }));
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

// Helper to format seconds → "0:12" or "12:34"
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `0:${secs.toString().padStart(2, '0')}`;
}