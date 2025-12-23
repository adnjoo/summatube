// SummaTube - Simple Transcript Panel (December 2025)

(function () {
  'use strict';

  // Get video ID from URL
  function getVideoId() {
    return new URLSearchParams(window.location.search).get('v');
  }

  // Try to open transcript and extract text
  async function fetchTranscript() {
    // Find and click the transcript button
    const button = document.querySelector('button[aria-label*="transcript" i], button[aria-label*="Transcript" i]');
    if (!button) return null;

    button.click();
    await new Promise(r => setTimeout(r, 1500)); // Wait for panel to open

    // Get all transcript lines
    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    if (segments.length === 0) return null;

    const lines = Array.from(segments).map(segment => {
      const time = segment.querySelector('[class*="timestamp"]')?.textContent.trim() || '';
      const text = segment.querySelector('[class*="text"]')?.textContent.trim() || '';
      return time ? `[${time}] ${text}` : text;
    }).filter(line => line);

    // Close the transcript panel
    document.querySelector('button[aria-label*="Close transcript" i]')?.click();

    return lines.join('\n\n');
  }

  // Create or update the panel
  function showPanel(transcriptText) {
    // Remove old panel if exists
    document.getElementById('summatube-panel')?.remove();

    const sidebar = document.getElementById('secondary') || document.querySelector('#related');
    if (!sidebar) return;

    const panel = document.createElement('div');
    panel.id = 'summatube-panel';
    panel.style.cssText = `
      margin: 16px 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    const headerStyle = `
      background: linear-gradient(to right, #c00, #f00);
      color: white;
      padding: 16px;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const contentStyle = `
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
      background: #f9f9f9;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      color: #333;
    `;

    let content;
    if (!transcriptText) {
      content = `<em style="color:#666; text-align:center; display:block; padding:40px 0;">
                 No transcript available for this video.
               </em>`;
    } else if (transcriptText === 'loading') {
      content = `<div style="text-align:center; padding:40px 0; color:#666;">
                 Loading transcript...
               </div>`;
    } else {
      content = transcriptText;
    }

    panel.innerHTML = `
      <div style="${headerStyle}">
        <div>
          📝 SummaTube<br>
          <small style="opacity:0.9; font-weight:normal;">Video Transcript</small>
        </div>
        <button style="background:none; border:none; color:white; font-size:28px; cursor:pointer;">×</button>
      </div>
      <div style="${contentStyle}">${content}</div>
    `;

    // Close button
    panel.querySelector('button').onclick = () => panel.remove();

    // Add to top of sidebar
    sidebar.insertBefore(panel, sidebar.firstChild);
  }

  // Main function
  async function run() {
    if (!getVideoId()) return;

    showPanel('loading'); // Show loading state

    const transcript = await fetchTranscript();

    showPanel(transcript || null); // Show final result
  }

  // Wait for YouTube page to load the sidebar
  const observer = new MutationObserver(() => {
    if (document.getElementById('secondary') || document.querySelector('#related')) {
      observer.disconnect();
      setTimeout(run, 1000);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback if page is already loaded
  if (document.getElementById('secondary') || document.querySelector('#related')) {
    setTimeout(run, 1000);
  }
})();