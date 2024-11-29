const API_URL = "https://www.summa.tube/api/"; // Base API URL

(function () {
  const toggleTranscript = (button) => {
    const container = document.querySelector("#custom-transcript-container");
    if (container) {
      const isHidden = container.style.display === "none";
      container.style.display = isHidden ? "block" : "none";
      button.innerText = isHidden ? "Hide Transcript" : "Show Transcript";
    } else {
      initTranscript(button);
    }
  };

  const initTranscript = (button) => {
    if (document.querySelector("#custom-transcript-container")) return;

    const container = document.createElement("div");
    container.id = "custom-transcript-container";
    container.className =
      "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg overflow-y-auto p-4 mt-2";

    const transcriptContent = document.createElement("div");
    transcriptContent.id = "transcript-content";
    transcriptContent.innerHTML =
      "<p class='text-gray-800 dark:text-gray-300'>Loading transcript...</p>";
    container.appendChild(transcriptContent);

    button.insertAdjacentElement("afterend", container);

    const videoId = new URLSearchParams(window.location.search).get("v");
    fetchTranscript(videoId).then((transcript) => {
      transcriptContent.innerHTML = formatTranscript(transcript);
      button.innerText = "Hide Transcript";
    });
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const addTranscriptButton = () => {
    const secondarySection = document.querySelector("#secondary");
    if (!secondarySection) {
      console.error("Could not find the #secondary section.");
      return;
    }

    const transcriptButton = document.createElement("button");
    transcriptButton.innerText = "Show Transcript";
    transcriptButton.className =
      "block my-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition";
    transcriptButton.onclick = () => toggleTranscript(transcriptButton);

    const summarizeButton = document.createElement("button");
    summarizeButton.id = "summarize-button";
    summarizeButton.innerText = "Summarize Video";
    summarizeButton.className =
      "block my-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition";
    summarizeButton.onclick = async () => {
      const videoId = new URLSearchParams(window.location.search).get("v");
      const summary = await fetchSummary(videoId);
      displaySummary(summary);
    };

    secondarySection.insertBefore(summarizeButton, secondarySection.firstChild);
    secondarySection.insertBefore(
      transcriptButton,
      secondarySection.firstChild
    );
  };

  const fetchSummary = async (videoId) => {
    const spinner = createLoadingSpinner();
    const summaryContainer = getOrCreateSummaryContainer();
    summaryContainer.innerHTML = ""; // Clear content before adding spinner
    summaryContainer.appendChild(spinner); // Add spinner to the container

    try {
      const response = await fetch(`${API_URL}summarize?video_id=${videoId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      summaryContainer.removeChild(spinner); // Remove spinner
      return data.summary;
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      summaryContainer.removeChild(spinner); // Remove spinner
      summaryContainer.innerHTML = `<p class="text-red-500">Failed to fetch summary. Please try again.</p>`;
      throw error;
    }
  };

  const displaySummary = (summary) => {
    const summaryContainer = getOrCreateSummaryContainer();
    summaryContainer.innerHTML = `
      <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Summary</h3>
      <p class="text-gray-800 dark:text-gray-300">${summary}</p>
    `;
  };

  const createLoadingSpinner = () => {
    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    spinner.style.cssText = `
      width: 24px;
      height: 24px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 10px auto;
    `;
    return spinner;
  };

  const getOrCreateSummaryContainer = () => {
    let summaryContainer = document.querySelector("#custom-summary-container");
    if (!summaryContainer) {
      summaryContainer = document.createElement("div");
      summaryContainer.id = "custom-summary-container";
      summaryContainer.className =
        "w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 shadow-lg overflow-y-auto p-4 mt-2";

      const summarizeButton = document.querySelector(
        "#summarize-button"
      );
      if (summarizeButton) {
        summarizeButton.appendChild(summaryContainer);
        // summarizeButton.insertAdjacentElement("afterend", summaryContainer);
      }
    }
    return summaryContainer;
  };

  // Add CSS for Spinner Animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  window.addEventListener("load", () => {
    setTimeout(addTranscriptButton, 2000);
  });
})();
