import React, { useState, useEffect } from "react";
import { Bot, Captions, ChevronDown } from "lucide-react";

const API_URL = "https://www.summa.tube/api/";

const ACTIVE_TAB_CLASS =
  "flex flex-row gap-4 px-4 py-2 text-sm font-medium border-b-2 border-blue-500 focus:outline-none";
const INACTIVE_TAB_CLASS =
  "flex flex-row gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 focus:outline-none";
const HIDDEN_SECTION_CLASS = "hidden";

const TranscriptSummaryUI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">(
    "transcript"
  );
  const [transcript, setTranscript] = useState<string | null>("Loading...");
  const [summary, setSummary] = useState<string | null>("Loading...");
  const [isContentHidden, setIsContentHidden] = useState(false);

  useEffect(() => {
    const videoId = new URLSearchParams(window.location.search).get("v");
    if (videoId) {
      fetchTranscript(videoId).then((data) =>
        setTranscript(formatTranscript(data))
      );
      fetchSummary(videoId).then((data) => setSummary(data));
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

  const formatTranscript = (intervals: any[]) => {
    return intervals
      .map(
        (interval) => `
          <p class="my-2 text-gray-800 dark:text-gray-300">
            <a href="#" class="text-blue-500 hover:underline timestamp" data-start="${
              interval.startTime
            }">
              ${formatTime(interval.startTime)} - ${formatTime(
          interval.endTime
        )}
            </a>: ${interval.text}
          </p>`
      )
      .join("");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const toggleContent = () => {
    setIsContentHidden((prev) => !prev);
  };

  return (
    <div
      id="custom-container"
      className={`overflow-y-scroll bg-white dark:bg-gray-800 border rounded shadow-lg`}
    >
      {/* Header with Tabs */}
      <div className="flex justify-between items-center border-b sticky top-0 z-50 bg-white dark:bg-gray-800 px-4 py-2">
        <div className="flex">
          <button
            id="transcript-tab"
            className={
              activeTab === "transcript" ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS
            }
            onClick={() => setActiveTab("transcript")}
          >
            <Captions size={24} />
            <span>Transcript</span>
          </button>
          <button
            id="summary-tab"
            className={
              activeTab === "summary" ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS
            }
            onClick={() => setActiveTab("summary")}
          >
            <Bot size={24} />
            <span>Summary</span>
          </button>
        </div>
        <button
          id="toggle-button"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"
          onClick={toggleContent}
        >
          <ChevronDown
            size={24}
            className={`${isContentHidden ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Content */}
      <div
        id="content-container"
        className={`h-[calc(100vh-170px)] ${
          isContentHidden ? HIDDEN_SECTION_CLASS : ""
        }`}
      >
        {activeTab === "transcript" ? (
          <div id="transcript-section" className="mt-4">
            {transcript ? (
              <div dangerouslySetInnerHTML={{ __html: transcript }} />
            ) : (
              <p className="text-gray-800 dark:text-gray-300">
                Loading transcript...
              </p>
            )}
          </div>
        ) : (
          <div id="summary-section" className="mt-4">
            {summary ? (
              <p>{summary}</p>
            ) : (
              <p className="text-gray-800 dark:text-gray-300">
                Loading summary...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptSummaryUI;
