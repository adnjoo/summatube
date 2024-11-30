import React, { useState, useEffect, useRef } from "react";
import Interval from "./Interval";
import { Bot, Captions, ChevronDown, Loader } from "lucide-react";

const API_URL = "https://www.summa.tube/api/";

const ACTIVE_TAB_CLASS =
  "flex flex-row gap-4 px-4 py-2 text-sm font-medium border-b-2 border-blue-500 focus:outline-none items-center";
const INACTIVE_TAB_CLASS =
  "flex flex-row gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 focus:outline-none items-center";
const HIDDEN_SECTION_CLASS = "hidden";

const TranscriptSummaryUI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">(
    "transcript"
  );
  const [transcript, setTranscript] = useState<any[]>([]);
  const [summary, setSummary] = useState<string | null>("Loading...");
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const videoId = new URLSearchParams(window.location.search).get("v");
    if (videoId) {
      setLoading(true);
      Promise.all([fetchTranscript(videoId), fetchSummary(videoId)])
        .then(([transcriptData, summaryData]) => {
          setTranscript(transcriptData);
          setSummary(summaryData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (isAutoScrollEnabled && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTime, isAutoScrollEnabled]);

  useEffect(() => {
    const videoElement = document.getElementsByTagName("video")[0];
    if (videoElement) {
      const updateTime = () => setCurrentTime(videoElement.currentTime);
      videoElement.addEventListener("timeupdate", updateTime);
      return () => videoElement.removeEventListener("timeupdate", updateTime);
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

  const toggleContent = () => {
    setIsContentHidden((prev) => !prev);
  };

  const toggleAutoScroll = () => {
    setIsAutoScrollEnabled((prev) => !prev);
  };

  const handleTimestampClick = (time: number) => {
    const videoElement = document.getElementsByTagName("video")[0];
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
        className={`h-[calc(100vh-170px)] px-4 ${
          isContentHidden ? HIDDEN_SECTION_CLASS : ""
        }`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader size={48} className="animate-spin text-blue-500" />
          </div>
        ) : activeTab === "transcript" ? (
          <div id="transcript-section" className="mt-4 relative">
            {/* Auto-Scroll Toggle */}
            <div className="sticky top-0 z-10 bg-white p-2 shadow">
              <div className="flex items-center justify-between">
                <button
                  className={`px-3 py-1 text-sm font-medium ${
                    isAutoScrollEnabled
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  } rounded`}
                  onClick={toggleAutoScroll}
                >
                  {isAutoScrollEnabled
                    ? "Disable Auto-Scroll"
                    : "Enable Auto-Scroll"}
                </button>
              </div>
            </div>
            {transcript.length > 0 ? (
              transcript.map((interval, index) => (
                <div
                  key={index}
                  ref={
                    activeTimestamp === interval
                      ? (ref) => {
                          activeRef.current = ref;
                        }
                      : null
                  }
                  className={`p-2 rounded ${
                    activeTimestamp === interval
                      ? "bg-blue-700" // Highlight the active section
                      : "hover:bg-gray-700"
                  }`}
                >
                  <Interval
                    startTime={interval.startTime}
                    endTime={interval.endTime}
                    text={interval.text}
                    onClick={handleTimestampClick}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-800 dark:text-gray-300">
                No transcript available.
              </p>
            )}
          </div>
        ) : (
          <div id="summary-section" className="mt-4">
            {summary ? (
              <p>{summary}</p>
            ) : (
              <p className="text-gray-800 dark:text-gray-300">
                No summary available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptSummaryUI;
