const API_URL = "https://www.summa.tube/api/"; // Base API URL

(function () {
  const toggleTranscript = (button) => {
    // Check if the transcript container already exists
    const container = document.querySelector("#custom-transcript-container");

    if (container) {
      // If the container exists, toggle its visibility
      const isHidden = container.style.display === "none";
      container.style.display = isHidden ? "block" : "none";

      // Update the button text
      button.innerText = isHidden ? "Hide Transcript" : "Show Transcript";
    } else {
      // If the container doesn't exist, initialize the transcript
      initTranscript(button);
    }
  };

  const initTranscript = (button) => {
    // Prevent duplicate containers
    if (document.querySelector("#custom-transcript-container")) return;

    // Create the container for the transcript
    const container = document.createElement("div");
    container.id = "custom-transcript-container";
    container.className =
      "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg overflow-y-auto p-4 mt-2";

    const transcriptContent = document.createElement("div");
    transcriptContent.id = "transcript-content";
    transcriptContent.innerHTML =
      "<p class='text-gray-800 dark:text-gray-300'>Loading transcript...</p>";
    container.appendChild(transcriptContent);

    // Insert the transcript container after the button
    button.parentNode.insertBefore(container, button.nextSibling);

    const videoId = new URLSearchParams(window.location.search).get("v");
    fetchTranscript(videoId).then((transcript) => {
      transcriptContent.innerHTML = formatTranscript(transcript);

      // Update button text to indicate hiding
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

    const button = document.createElement("button");
    button.innerText = "Show Transcript";
    button.className =
      "block my-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition";

    // Attach click event to toggle the transcript
    button.onclick = () => toggleTranscript(button);

    secondarySection.insertBefore(button, secondarySection.firstChild);
  };

  const setupTimestampClicks = () => {
    document.querySelectorAll(".timestamp").forEach((timestamp) => {
      timestamp.addEventListener("click", (event) => {
        event.preventDefault();
        const startTime = parseFloat(timestamp.getAttribute("data-start"));

        // Seek to the correct position in the video
        const video = document.querySelector("video");
        if (video) {
          video.currentTime = startTime;
          video.play();
        } else {
          console.error("Video element not found.");
        }
      });
    });
  };

  window.addEventListener("load", () => {
    setTimeout(addTranscriptButton, 2000);
  });

  // Listen for transcript container changes to set up timestamp clicks
  const observer = new MutationObserver(() => {
    setupTimestampClicks();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
