'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { type Example } from '@/app/page';
import { MarqueeCard } from '@/components/MarqueeCard';
import { SummaryCard } from '@/components/SummaryCard';
import { Marquee } from '@/components/layout/Marquee';
import { Button, Input, Switch } from '@/components/ui';
import {
  extractVideoId,
  getTitle,
  getYouTubeURL,
  isValidYouTubeUrl,
} from '@/lib/helpers';
import { useFocusShortcut, useUser } from '@/lib/hooks';

export default function LandingBody({ examples }: { examples: Example[] }) {
  const searchParams = useSearchParams();
  const initialVideoId = searchParams.get('v') || '';
  const router = useRouter();
  const user = useUser();

  const [url, setUrl] = useState('');
  const [video_id, setVideoId] = useState(initialVideoId);
  const [summary, setSummary] = useState<any>(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState<boolean | undefined>(
    undefined
  );
  const [saveHistory, setSaveHistory] = useState<boolean | undefined>(
    undefined
  );
  const [thumbnailTitle, setThumbnailTitle] = useState('');

  useEffect(() => {
    const showExamplesStored = localStorage.getItem('showExamples');
    const saveHistoryStored = localStorage.getItem('saveHistory');
    setShowExamples(showExamplesStored ? JSON.parse(showExamplesStored) : true);
    setSaveHistory(saveHistoryStored ? JSON.parse(saveHistoryStored) : false);
  }, []);

  useEffect(() => {
    if (typeof showExamples === 'boolean') {
      localStorage.setItem('showExamples', JSON.stringify(showExamples));
    }
    if (typeof saveHistory === 'boolean') {
      localStorage.setItem('saveHistory', JSON.stringify(saveHistory));
    }
  }, [showExamples, saveHistory]);

  useEffect(() => {
    if (!video_id) return;
    const url = getYouTubeURL({
      video_id,
    });
    if (isValidYouTubeUrl(url)) {
      fetchEmbed(video_id);
      getTitle(url).then((title) => {
        setThumbnailTitle(title);
      });

      const params = new URLSearchParams();
      params.set('v', video_id);
      router.push(`?${params.toString()}`);

      handleSummarize(video_id);
    }
  }, [video_id]);

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const videoURL = event.target.value;
    setUrl(videoURL);

    const extractedVideoId = extractVideoId(videoURL) as string;
    setVideoId(extractedVideoId);

    if (isValidYouTubeUrl(videoURL)) {
      fetchEmbed(extractedVideoId);
      const title = await getTitle(videoURL);
      setThumbnailTitle(title);
    } else {
      setEmbedUrl('');
      setThumbnailTitle('');
    }
  };

  const fetchEmbed = (video_id: string) => {
    const embed = getYouTubeURL({
      video_id,
      embed: true,
    });
    setEmbedUrl(embed);
  };

  const handleSummarize = async (video_id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/summarize?video_id=${encodeURIComponent(video_id)}&save=${saveHistory}`
      );
      const summary = await response.json();
      setSummary(summary);
    } catch (error) {
      console.error('Error processing summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailClick = async (
    exampleVideoId: string,
    exampleVideoTitle: string
  ) => {
    setVideoId(exampleVideoId);
    fetchEmbed(exampleVideoId);
    setThumbnailTitle(exampleVideoTitle);

    handleSummarize(exampleVideoId);
  };

  return (
    <main className='mt-4 flex min-h-screen flex-col sm:p-8'>
      <div className='mx-auto mb-8 flex items-center'>
        <span className='mr-2 text-lg font-semibold'>Show Latest</span>
        <Switch checked={showExamples} onCheckedChange={setShowExamples} />

        {user ? (
          <>
            <span className='ml-6 mr-2 text-lg font-semibold'>
              Save History
            </span>
            <Switch checked={saveHistory} onCheckedChange={setSaveHistory} />
          </>
        ) : null}
      </div>

      {showExamples && (
        <Marquee>
          {examples.map((example: Example) => (
            <MarqueeCard
              key={example.video_id}
              example={example}
              handleThumbnailClick={handleThumbnailClick}
            />
          ))}
        </Marquee>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSummarize(video_id);
        }}
        className='mx-auto flex w-full max-w-md flex-col items-center'
      >
        <Input
          type='url'
          placeholder='Enter YouTube URL e.g. https://www.youtube.com/watch?v=62wEk02YKs0&pp=ygUIYmJjIG5ld3M%3D'
          value={url}
          onChange={handleInputChange}
          className='mb-4'
        />
        <Button type='submit' disabled={loading} className='relative'>
          Summarize
        </Button>
      </form>
      {embedUrl && (
        <div className='mx-auto mt-4 flex h-full w-full flex-col items-center sm:max-w-xl'>
          <h3 className='sr-only mb-2 text-lg'>Embed</h3>
          <iframe
            src={embedUrl}
            title='YouTube Embed'
            className='aspect-video h-auto w-full rounded'
            allowFullScreen
          />
          {thumbnailTitle && (
            <div className='mt-1 text-center text-xs'>{thumbnailTitle}</div>
          )}
        </div>
      )}
      {loading && <Loader2 className='mx-auto mt-8 h-12 w-12 animate-spin' />}
      {<SummaryCard summary={summary} loading={loading} video_id={video_id} />}
    </main>
  );
}
