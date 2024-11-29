(function () {
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
    });
  };

  const fetchTranscript = async (videoId) => {
    const response = await fetch(
      `https://www.summa.tube/api/get-timestamps?video_id=${videoId}`
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
            `<p class="my-2 text-gray-800 dark:text-gray-300"><strong class="text-gray-900 dark:text-gray-100">${formatTime(
              interval.startTime
            )} - ${formatTime(interval.endTime)}</strong>: ${interval.text}</p>`
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

    // Attach click event to initialize the transcript
    button.onclick = () => initTranscript(button);

    secondarySection.insertBefore(button, secondarySection.firstChild);
  };

  window.addEventListener("load", () => {
    setTimeout(addTranscriptButton, 2000);
  });
})();
