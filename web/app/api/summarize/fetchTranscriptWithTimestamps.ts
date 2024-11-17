import { Innertube } from 'youtubei.js/web';

export const fetchTranscriptWithTimestamps = async (video_id: string) => {
  const youtube = await Innertube.create({
    lang: 'en',
    location: 'US',
    retrieve_player: false,
  });

  try {
    const info = await youtube.getInfo(video_id);
    const transcriptData = await info.getTranscript();

    // console.log('Transcript data:', transcriptData?.transcript?.content?.body?.initial_segments);

    const segments: any =
      transcriptData?.transcript?.content?.body?.initial_segments.map(
        (segment: any) => ({
          start_ms: segment.start_ms, // Start time in ms
          end_ms: segment.end_ms, // End time in ms
          snippet: segment.snippet.text, // Transcript text
          start_time_text: segment.start_time_text?.text, // Pre-formatted time
          target_id: segment.target_id, // Optional navigation ID
        })
      );

    // Convert to seconds and group by 30-second intervals
    const groupedByInterval = segments.reduce((acc, segment) => {
      const startTime = parseInt(segment.start_ms, 10) / 1000; // Convert ms to seconds
      const intervalIndex = Math.floor(startTime / 30); // Determine the 30-second interval

      if (!acc[intervalIndex]) {
        acc[intervalIndex] = {
          startTime: intervalIndex * 30,
          endTime: (intervalIndex + 1) * 30,
          text: [],
        };
      }

      acc[intervalIndex].text.push(segment.snippet); // Add transcript text to the interval

      return acc;
    }, []);

    // console.log('Grouped by interval:', groupedByInterval);

    // Convert to an array
    return Object.values(groupedByInterval).map((interval: any) => ({
      startTime: interval.startTime,
      endTime: interval.endTime,
      text: interval.text.join(' '), // Join text for the interval
    }));
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};
