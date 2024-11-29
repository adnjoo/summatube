const API_URL = "https://www.summa.tube/api/"; // Base API URL
const captionsIconUrl = chrome.runtime.getURL("assets/captions.svg");
const botIconUrl = chrome.runtime.getURL("assets/bot.svg");

(function () {
  const addTranscriptAndSummaryUI = () => {
    const secondarySection = document.querySelector("#secondary");
    if (!secondarySection) {
      console.error("Could not find the #secondary section.");
      return;
    }

    // Main container for the UI
    const container = document.createElement("div");
    container.id = "custom-container";
    container.className =
      "bg-white dark:bg-gray-800 border rounded shadow-lg p-4 mt-4";

    // Header with Tabs
    const header = document.createElement("div");
    header.className = "flex border-b";

    const transcriptTab = document.createElement("button");
    transcriptTab.id = "transcript-tab";
    transcriptTab.className =
      "px-4 py-2 text-sm font-medium border-b-2 border-blue-500 focus:outline-none";
    transcriptTab.innerHTML = `
    <img src=${captionsIconUrl} alt="Captions Icon" class="w-5 h-5">
    <span>Transcript</span>
  `;
    transcriptTab.onclick = () => switchTab("transcript");

    const summaryTab = document.createElement("button");
    // summaryTab.innerText = "Summary";
    summaryTab.id = "summary-tab";
    summaryTab.className =
      "px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 focus:outline-none";
    summaryTab.innerHTML = `
    <img src=${botIconUrl} alt="Bot Icon" class="w-5 h-5">
    <span>Summary</span>
    `;
    summaryTab.onclick = () => switchTab("summary");

    header.appendChild(transcriptTab);
    header.appendChild(summaryTab);

    // Content Sections
    const transcriptSection = document.createElement("div");
    transcriptSection.id = "transcript-section";
    transcriptSection.className = "mt-4";
    transcriptSection.innerHTML =
      "<p class='text-gray-800 dark:text-gray-300'>Loading transcript...</p>";

    const summarySection = document.createElement("div");
    summarySection.id = "summary-section";
    summarySection.className = "mt-4 hidden";
    summarySection.innerHTML =
      "<p class='text-gray-800 dark:text-gray-300'>Loading summary...</p>";

    container.appendChild(header);
    container.appendChild(transcriptSection);
    container.appendChild(summarySection);

    secondarySection.insertBefore(container, secondarySection.firstChild);

    // Fetch and Load Data
    const videoId = new URLSearchParams(window.location.search).get("v");
    fetchTranscript(videoId).then((transcript) => {
      transcriptSection.innerHTML = formatTranscript(transcript);
    });
    fetchSummary(videoId).then((summary) => {
      summarySection.innerHTML = `<p>${summary}</p>`;
    });
  };

  const switchTab = (tab) => {
    const transcriptTab = document.getElementById("transcript-tab");
    const summaryTab = document.getElementById("summary-tab");
    const transcriptSection = document.getElementById("transcript-section");
    const summarySection = document.getElementById("summary-section");

    if (tab === "transcript") {
      transcriptTab.className =
        "px-4 py-2 text-sm font-medium border-b-2 border-blue-500 focus:outline-none";
      summaryTab.className =
        "px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 focus:outline-none";
      transcriptSection.classList.remove("hidden");
      summarySection.classList.add("hidden");
    } else {
      summaryTab.className =
        "px-4 py-2 text-sm font-medium border-b-2 border-blue-500 focus:outline-none";
      transcriptTab.className =
        "px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 focus:outline-none";
      summarySection.classList.remove("hidden");
      transcriptSection.classList.add("hidden");
    }
  };

  const fetchTranscript = async (videoId) => {
    const response = await fetch(
      `${API_URL}get-timestamps?video_id=${videoId}`
    );
    const data = await response.json();
    return data.intervals;
  };

  const formatTranscript = (intervals) => {
    return `
      <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Transcript</h3>
      ${intervals
        .map(
          (interval) =>
            `<p class="my-2 text-gray-800 dark:text-gray-300">
              <a href="#" class="text-blue-500 hover:underline timestamp" data-start="${
                interval.startTime
              }">
                ${formatTime(interval.startTime)} - ${formatTime(
              interval.endTime
            )}
              </a>: ${interval.text}
            </p>`
        )
        .join("")}
    `;
  };

  const fetchSummary = async (videoId) => {
    const response = await fetch(`${API_URL}summarize?video_id=${videoId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.summary;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Add the UI once the page has loaded
  window.addEventListener("load", () => {
    setTimeout(addTranscriptAndSummaryUI, 2000);
  });
})();
