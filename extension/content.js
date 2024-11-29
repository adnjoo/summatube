const API_URL = "https://www.summa.tube/api/"; // Base API URL
const captionsIcon = chrome.runtime.getURL("assets/captions.svg");
const botIcon = chrome.runtime.getURL("assets/bot.svg");
const chevronIcon = chrome.runtime.getURL("assets/chevron-down.svg");
const ACTIVE_TAB_CLASS =
  "flex flex-row gap-4 px-4 py-2 text-sm font-medium border-b-2 border-blue-500 focus:outline-none";
const INACTIVE_TAB_CLASS =
  "flex flex-row gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-blue-500 focus:outline-none";
const HIDDEN_SECTION_CLASS = "hidden";

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
      "overflow-y-scroll bg-white dark:bg-gray-800 border rounded shadow-lg";

    // Header with Tabs and Chevron
    const header = document.createElement("div");
    header.className =
      "flex justify-between items-center border-b sticky top-0 z-50 bg-white dark:bg-gray-800 px-4 py-2";

    // Tabs Container
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "flex";

    const transcriptTab = document.createElement("button");
    transcriptTab.id = "transcript-tab";
    transcriptTab.className = ACTIVE_TAB_CLASS;
    transcriptTab.innerHTML = `
      <img src=${captionsIcon} alt="Captions Icon" class="w-5 h-5">
      <span>Transcript</span>
    `;
    transcriptTab.onclick = () => switchTab("transcript");

    const summaryTab = document.createElement("button");
    summaryTab.id = "summary-tab";
    summaryTab.className = INACTIVE_TAB_CLASS;
    summaryTab.innerHTML = `
      <img src=${botIcon} alt="Bot Icon" class="w-5 h-5">
      <span>Summary</span>
    `;
    summaryTab.onclick = () => switchTab("summary");

    tabsContainer.appendChild(transcriptTab);
    tabsContainer.appendChild(summaryTab);

    // Chevron Button
    const toggleButton = document.createElement("button");
    toggleButton.id = "toggle-button";
    toggleButton.className =
      "flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700";
    toggleButton.innerHTML = `<img src=${chevronIcon} alt="Toggle" class="w-4 h-4 transform rotate-0">`;
    toggleButton.onclick = () =>
      toggleContent("content-container", toggleButton);

    // Append Tabs and Chevron to Header
    header.appendChild(tabsContainer);
    header.appendChild(toggleButton);

    // Content Container
    const contentContainer = document.createElement("div");
    contentContainer.id = "content-container";
    contentContainer.className = "h-[calc(100vh-170px)]";

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

    contentContainer.appendChild(transcriptSection);
    contentContainer.appendChild(summarySection);

    container.appendChild(header);
    container.appendChild(contentContainer);

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
      transcriptTab.className = ACTIVE_TAB_CLASS;
      summaryTab.className = INACTIVE_TAB_CLASS;

      transcriptSection.classList.remove(HIDDEN_SECTION_CLASS);
      summarySection.classList.add(HIDDEN_SECTION_CLASS);
    } else if (tab === "summary") {
      summaryTab.className = ACTIVE_TAB_CLASS;
      transcriptTab.className = INACTIVE_TAB_CLASS;

      summarySection.classList.remove(HIDDEN_SECTION_CLASS);
      transcriptSection.classList.add(HIDDEN_SECTION_CLASS);
    }
  };

  const toggleContent = (containerId, toggleButton) => {
    const contentContainer = document.getElementById(containerId);
    const chevronIcon = toggleButton.querySelector("img");

    if (contentContainer.classList.contains(HIDDEN_SECTION_CLASS)) {
      contentContainer.classList.remove(HIDDEN_SECTION_CLASS);
      chevronIcon.classList.remove("rotate-180");
    } else {
      contentContainer.classList.add(HIDDEN_SECTION_CLASS);
      chevronIcon.classList.add("rotate-180");
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
