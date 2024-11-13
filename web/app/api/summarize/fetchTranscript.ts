import { Innertube } from 'youtubei.js/web';

export const fetchTranscript = async (video_id: string) => {

  const youtube = await Innertube.create({
    lang: 'en',
    location: 'US',
    retrieve_player: false,
  });

  try {
    const info = await youtube.getInfo(video_id);
    const title = info.primary_info?.title.text;
    const transcriptData = await info.getTranscript();
    const transcript =
      transcriptData?.transcript?.content?.body?.initial_segments.map(
        (segment) => segment.snippet.text
      );

    return { title, transcript };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};
