(function () {
  const initTranscript = () => {
    // Check if a transcript container already exists
    if (document.querySelector("#custom-transcript-container")) return;

    // Create a container for the transcript
    const container = document.createElement("div");
    container.id = "custom-transcript-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.right = "0";
    container.style.width = "300px";
    container.style.height = "100%";
    container.style.background = "white";
    container.style.borderLeft = "1px solid #ccc";
    container.style.zIndex = "10000";
    container.style.overflowY = "auto";
    container.style.padding = "10px";
    container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";

    // Add a close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.onclick = () => container.remove();
    container.appendChild(closeButton);

    // Add transcript content
    const transcriptContent = document.createElement("div");
    transcriptContent.id = "transcript-content";
    transcriptContent.innerHTML = "<p>Loading transcript...</p>";
    container.appendChild(transcriptContent);

    // Append the container to the body
    document.body.appendChild(container);

    // Fetch the transcript from the API
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
      <h3>Transcript</h3>
      ${intervals
        .map(
          (interval) =>
            `<p><strong>${formatTime(interval.startTime)} - ${formatTime(
              interval.endTime
            )}</strong>: ${interval.text}</p>`
        )
        .join("")}
    `;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Add a button to the YouTube UI
  const addTranscriptButton = () => {
    const button = document.createElement("button");
    button.innerText = "Show Transcript";
    button.style.position = "fixed";
    button.style.bottom = "10px";
    button.style.right = "10px";
    button.style.zIndex = "10000";
    button.style.padding = "10px 20px";
    button.style.backgroundColor = "#FF0000";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";

    button.onclick = initTranscript;

    document.body.appendChild(button);
  };

  // Wait for the YouTube page to fully load
  window.addEventListener("load", addTranscriptButton);
})();
