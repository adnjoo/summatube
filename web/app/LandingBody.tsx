'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { type Example } from '@/app/page';
import { MarqueeCard } from '@/components/MarqueeCard';
import { SummaryCard } from '@/components/SummaryCard';
import { TimestampsPanel } from '@/components/TimestampsPanel';
import { YouTubePlayer } from '@/components/YoutubePlayer';
import { Marquee } from '@/components/layout/Marquee';
import { Button, Input, Switch } from '@/components/ui';
// import { AppConfig } from '@/lib/constants';
import {
  extractVideoId,
  getYouTubeURL,
  isValidYouTubeUrl,
} from '@/lib/helpers';
import { useUser } from '@/lib/hooks';

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
  const [showExamples, setShowExamples] = useState<boolean>(true);
  const [saveHistory, setSaveHistory] = useState<boolean>(false);
  const [thumbnailTitle, setThumbnailTitle] = useState('');
  const [player, setPlayer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptChunks, setTranscriptChunks] = useState<any[]>([]);

  const handlePlayerTimeUpdate = () => {
    if (player) {
      setCurrentTime(Math.floor(player.getCurrentTime()));
    }
  };

  useEffect(() => {
    if (player) {
      const interval = setInterval(handlePlayerTimeUpdate, 1000);
      return () => clearInterval(interval);
    }
  }, [player]);

  const handlePlayerReady = (ytPlayer: any) => {
    setPlayer(ytPlayer);
  };

  const handleSeek = (seconds: number) => {
    if (player) {
      player.seekTo(seconds, true);
    }
  };

  // Safe localStorage loading
  useEffect(() => {
    try {
      const show = localStorage.getItem('showExamples');
      const save = localStorage.getItem('saveHistory');

      setShowExamples(show !== null ? JSON.parse(show) : true);
      setSaveHistory(save !== null ? JSON.parse(save) : false);
    } catch (err) {
      console.warn('Corrupted localStorage, resetting defaults');
      setShowExamples(true);
      setSaveHistory(false);
    }
  }, []);

  // Safe localStorage saving
  useEffect(() => {
    if (showExamples !== undefined && saveHistory !== undefined) {
      try {
        localStorage.setItem('showExamples', JSON.stringify(showExamples));
        localStorage.setItem('saveHistory', JSON.stringify(saveHistory));
      } catch (err) {
        console.warn('Failed to save to localStorage');
      }
    }
  }, [showExamples, saveHistory]);

  // Client-side transcript + title + summary
  useEffect(() => {
    if (!video_id) {
      setTranscriptChunks([]);
      setSummary(null);
      setThumbnailTitle('');
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch transcript from server API
        const transcriptRes = await fetch('/api/fetch-transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_id }),
        });

        if (!transcriptRes.ok) {
          const errorData = await transcriptRes.json();
          throw new Error(errorData.error || 'Failed to fetch transcript');
        }

        const transcriptData = await transcriptRes.json();
        const { title, transcript: fullText } = transcriptData;

        setThumbnailTitle(title);

        // Create basic chunks from the full text (since server doesn't provide timing)
        // Split into roughly equal chunks for display purposes
        const words = fullText.split(' ');
        const chunkSize = Math.ceil(words.length / 10); // Split into ~10 chunks
        const chunks = [];

        for (let i = 0; i < words.length; i += chunkSize) {
          const chunkWords = words.slice(i, i + chunkSize);
          chunks.push({
            startTime: Math.floor(i / words.length * 300), // Approximate timing
            endTime: Math.floor((i + chunkSize) / words.length * 300),
            text: chunkWords.join(' ').trim(),
          });
        }

        setTranscriptChunks(chunks);

        // Send to server for AI summary
        const summaryRes = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: fullText,
            video_id,
            save: saveHistory,
          }),
        });

        if (!summaryRes.ok) {
          const errorData = await summaryRes.json();
          throw new Error(errorData.error || 'Summary failed');
        }

        const data = await summaryRes.json();
        setSummary(data);
      } catch (err: any) {
        console.error('Error:', err);
        setTranscriptChunks([]);
        setSummary({ error: err.message || 'Failed to load video data' });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [video_id]);

  useEffect(() => {
    if (!video_id) return;

    const url = getYouTubeURL({ video_id });
    if (isValidYouTubeUrl(url)) {
      setEmbedUrl(getYouTubeURL({ video_id, embed: true }));

      const params = new URLSearchParams(searchParams);
      params.set('v', video_id);
      router.replace(`?${params.toString()}`);
    }
  }, [video_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoURL = e.target.value;
    setUrl(videoURL);
    const extracted = extractVideoId(videoURL) as string;
    setVideoId(extracted);

    if (isValidYouTubeUrl(videoURL)) {
      setEmbedUrl(getYouTubeURL({ video_id: extracted, embed: true }));
    } else {
      setEmbedUrl('');
    }
  };

  return (
    <main className='mt-4 flex min-h-screen flex-col md:p-4'>
      <div className='mx-auto mb-4 flex items-center'>
        <span className='mr-2 text-lg font-semibold'>Show Latest</span>
        <Switch checked={showExamples ?? true} onCheckedChange={setShowExamples} />

        {user && (
          <>
            <span className='ml-6 mr-2 text-lg font-semibold'>Save History</span>
            <Switch checked={saveHistory ?? false} onCheckedChange={setSaveHistory} />
          </>
        )}
      </div>

      {showExamples && (
        <Marquee>
          {examples.map((example) => (
            <MarqueeCard
              key={example.video_id}
              example={example}
              handleThumbnailClick={(id, title) => {
                setVideoId(id);
                setThumbnailTitle(title);
              }}
            />
          ))}
        </Marquee>
      )}

      <form onSubmit={(e) => e.preventDefault()} className='mx-auto flex w-full max-w-md flex-row items-center gap-2'>
        <Input
          type='url'
          placeholder='Enter YouTube URL'
          value={url}
          onChange={handleInputChange}
          className='mb-4'
        />
        <Button type='submit' disabled={loading} className='relative mb-4'>
          {loading ? 'Loading...' : 'Summarize'}
        </Button>
      </form>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          <div className='flex justify-center'>
            {embedUrl && <YouTubePlayer videoId={video_id} onReady={handlePlayerReady} />}
          </div>

          {video_id && (
            <div className='space-y-6'>
              <div className='w-full max-w-3xl'>
                <SummaryCard summary={summary} loading={loading} video_id={video_id} />
              </div>

              <div className='w-full max-w-3xl'>
                <TimestampsPanel
                  videoId={video_id}
                  onSeek={handleSeek}
                  currentTime={currentTime}
                  thumbnailTitle={thumbnailTitle}
                  clientChunks={transcriptChunks}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}