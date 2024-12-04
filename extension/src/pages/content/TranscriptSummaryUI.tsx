import { Bot, Captions, ChevronDown, Loader } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { useCheckSession } from '@/helpers/useCheckSession';
import Interval from '@/pages/content/Interval';
import { NonAuth } from '@/pages/content/NonAuth';

const API_URL = 'https://www.summa.tube/api/';

const ACTIVE_TAB_CLASS =
  'flex flex-row gap-4 px-4 py-2 text-sm font-medium text-black border-b-2 border-blue-500 items-center transition-all group dark:text-white';
const INACTIVE_TAB_CLASS =
  'flex flex-row gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent items-center transition-all group';

const TranscriptSummaryUI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>(
    'transcript'
  );
  const [transcript, setTranscript] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>('Loading...');
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState<boolean>(true);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, loading, pfpUrl } = useCheckSession();

  useEffect(() => {
    if (isLoggedIn) {
      const videoId = new URLSearchParams(window.location.search).get('v');
      if (videoId) {
        // Fetch transcript
        setTranscriptLoading(true);
        fetchTranscript(videoId)
          .then((transcriptData) => setTranscript(transcriptData))
          .catch((error) => {
            console.error('Error fetching transcript:', error);
            setTranscript([]);
          })
          .finally(() => setTranscriptLoading(false));

        // Fetch summary
        setSummaryLoading(true);
        fetchSummary(videoId)
          .then((summaryData) => setSummary(summaryData))
          .catch((error) => {
            console.error('Error fetching summary:', error);
            setSummary('Failed to fetch summary.');
          })
          .finally(() => setSummaryLoading(false));
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isAutoScrollEnabled && activeRef.current) {
      const container = document.getElementById('content-container');
      const activeElement = activeRef.current;

      if (container && activeElement) {
        const containerBounds = container.getBoundingClientRect();
        const activeBounds = activeElement.getBoundingClientRect();

        if (
          activeBounds.top < containerBounds.top ||
          activeBounds.bottom > containerBounds.bottom
        ) {
          container.scrollTo({
            top:
              activeElement.offsetTop -
              container.offsetTop -
              container.clientHeight / 2 +
              activeElement.clientHeight / 2,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentTime, isAutoScrollEnabled]);

  useEffect(() => {
    const videoElement = document.getElementsByTagName('video')[0];
    if (videoElement) {
      const updateTime = () => setCurrentTime(videoElement.currentTime);
      videoElement.addEventListener('timeupdate', updateTime);
      return () => videoElement.removeEventListener('timeupdate', updateTime);
    }
  }, []);

  const fetchTranscript = async (videoId: string) => {
    const response = await fetch(
      `${API_URL}get-timestamps?video_id=${videoId}`
    );
    const data = await response.json();
    return data.intervals;
  };

  const fetchSummary = async (videoId: string) => {
    const response = await fetch(`${API_URL}summarize?video_id=${videoId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.summary;
  };

  const handleTimestampClick = (time: number) => {
    const videoElement = document.getElementsByTagName('video')[0];
    if (videoElement) {
      videoElement.currentTime = time;
      videoElement.play();
    }
  };

  const getActiveTimestamp = () => {
    return transcript.find(
      (interval) =>
        currentTime >= interval.startTime && currentTime < interval.endTime
    );
  };

  const activeTimestamp = getActiveTimestamp();

  return (
    <div
      id='custom-container'
      className='rounded-md border border-solid border-gray-300 bg-white shadow-lg dark:!border-gray-600 dark:bg-gray-800'
    >
      {!isLoggedIn ? (
        <div className='p-2'>
          <NonAuth />
        </div>
      ) : (
        <>
          {/* Header with Tabs */}
          <div className='sticky top-0 z-50 flex items-center justify-between rounded-md border-b bg-white px-4 py-2 dark:bg-gray-800'>
            <div className='flex'>
              <button
                id='transcript-tab'
                className={
                  activeTab === 'transcript'
                    ? ACTIVE_TAB_CLASS
                    : INACTIVE_TAB_CLASS
                }
                onClick={() => setActiveTab('transcript')}
              >
                <Captions
                  size={24}
                  className='group-hover:stroke-black dark:group-hover:stroke-white'
                />
                <span className='group-hover:text-black dark:group-hover:text-white'>
                  Transcript
                </span>
              </button>
              <button
                id='summary-tab'
                className={
                  activeTab === 'summary'
                    ? ACTIVE_TAB_CLASS
                    : INACTIVE_TAB_CLASS
                }
                onClick={() => setActiveTab('summary')}
              >
                <Bot
                  size={24}
                  className='group-hover:stroke-black dark:group-hover:stroke-white'
                />
                <span className='group-hover:text-black dark:group-hover:text-white'>
                  Summary
                </span>
              </button>
            </div>
            <div className='flex gap-1'>
              <img
                src={pfpUrl}
                alt='Profile'
                className='h-8 w-8 rounded-full'
              />
              <button
                id='toggle-button'
                className='flex h-8 w-8 items-center justify-center rounded-full'
                onClick={() => setIsContentHidden((prev) => !prev)}
              >
                <ChevronDown
                  size={24}
                  className={`${
                    isContentHidden ? 'rotate-180' : ''
                  } stroke-gray-300 transition-all hover:stroke-gray-500 dark:stroke-gray-500 dark:hover:stroke-gray-300`}
                />
              </button>
            </div>
          </div>

          {/* Auto-Scroll Button */}
          {activeTab === 'transcript' && (
            <div
              className={`sticky top-[46px] z-50 bg-white p-3 dark:bg-gray-800 ${
                isContentHidden ? 'hidden' : ''
              }`}
            >
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  isAutoScrollEnabled
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                } rounded`}
                onClick={() => setIsAutoScrollEnabled((prev) => !prev)}
              >
                {isAutoScrollEnabled
                  ? 'Disable Auto-Scroll'
                  : 'Enable Auto-Scroll'}
              </button>
            </div>
          )}

          {/* Content */}
          <div
            id='content-container'
            className={`h-[calc(100vh-170px)] overflow-y-scroll px-4 ${
              isContentHidden ? 'hidden' : ''
            }`}
          >
            {activeTab === 'transcript' ? (
              transcriptLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <Loader size={48} className='animate-spin text-blue-500' />
                </div>
              ) : transcript.length > 0 ? (
                <div id='transcript-section' className='relative mt-4'>
                  {transcript.map((interval, index) => (
                    <div
                      key={index}
                      ref={
                        activeTimestamp === interval
                          ? (ref) => {
                              activeRef.current = ref;
                            }
                          : null
                      }
                      className={`rounded p-2 ${
                        activeTimestamp === interval
                          ? 'bg-blue-700' // Highlight the active section
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <Interval
                        startTime={interval.startTime}
                        endTime={interval.endTime}
                        text={interval.text}
                        onClick={handleTimestampClick}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-800 dark:text-gray-300'>
                  No transcript available.
                </p>
              )
            ) : summaryLoading ? (
              <div className='flex h-full items-center justify-center'>
                <Loader size={48} className='animate-spin text-blue-500' />
              </div>
            ) : (
              <div
                id='summary-section'
                className='mt-4 text-gray-800 dark:text-gray-300'
              >
                {summary ? <p>{summary}</p> : <p>No summary available.</p>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TranscriptSummaryUI;
