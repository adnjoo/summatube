// SummaTube - Beautiful Transcript Panel (Cool Edition - December 2025)

(function () {
  'use strict';

  function getVideoId() {
    return new URLSearchParams(window.location.search).get('v');
  }

  async function fetchTranscript() {
    const button = document.querySelector('button[aria-label*="transcript" i], button[aria-label*="Transcript" i]');
    if (!button) return null;

    button.click();
    await new Promise(r => setTimeout(r, 1800));

    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    if (segments.length === 0) {
      document.querySelector('button[aria-label*="Close transcript" i]')?.click();
      return null;
    }

    const lines = Array.from(segments).map(segment => {
      const time = segment.querySelector('[class*="timestamp"]')?.textContent.trim() || '';
      const text = segment.querySelector('[class*="text"]')?.textContent.trim() || '';
      return time ? `[${time}] ${text}` : text;
    }).filter(line => line);

    document.querySelector('button[aria-label*="Close transcript" i]')?.click();

    return lines.join('\n\n');
  }

  function showPanel(transcriptText) {
    document.getElementById('summatube-panel')?.remove();

    const sidebar = document.getElementById('secondary') || document.querySelector('#related');
    if (!sidebar) return;

    const panel = document.createElement('div');
    panel.id = 'summatube-panel';
    panel.style.cssText = `
      margin: 20px 0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: "Roboto", "YouTube Sans", sans-serif;
      animation: slideUp 0.4s ease-out;
      max-width: 400px;
    `;

    // Detect dark mode
    const isDark = document.documentElement.getAttribute('dark') !== null ||
                   document.body.classList.contains('ytd-watch-flexy--dark-theme');

    const bgColor = isDark ? 'rgba(15, 15, 15, 0.85)' : 'rgba(255, 255, 255, 0.92)';
    const textColor = isDark ? '#e0e0e0' : '#0f0f0f';
    const secondaryText = isDark ? '#aaaaaa' : '#606060';
    const headerGradient = isDark
      ? 'linear-gradient(135deg, #8B00FF, #FF006E)'  // Vibrant purple to pink
      : 'linear-gradient(135deg, #A100FF, #FF3578)'; // Slightly lighter for light mode

    const headerStyle = `
      background: ${headerGradient};
      padding: 18px 20px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 15px rgba(139, 0, 255, 0.3);
    `;

    const titleStyle = `
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    `;

    const subtitleStyle = `
      font-size: 13px;
      opacity: 0.9;
      margin-top: 2px;
    `;

    const contentStyle = `
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;
      background: ${bgColor};
      color: ${textColor};
      font-size: 14.5px;
      line-height: 1.7;
      white-space: pre-wrap;
      scrollbar-width: thin;
      scrollbar-color: #888 transparent;
    `;

    let contentHTML;
    if (!transcriptText) {
      contentHTML = `
        <div style="text-align:center; padding:60px 20px; color:${secondaryText}; font-style:italic;">
          <div style="font-size:48px; margin-bottom:16px; opacity:0.3;">📜</div>
          <div>No transcript available for this video.</div>
        </div>`;
    } else if (transcriptText === 'loading') {
      contentHTML = `
        <div style="text-align:center; padding:60px 20px; color:${secondaryText};">
          <div style="font-size:48px; margin-bottom:16px;">⏳</div>
          <div>Loading transcript...</div>
        </div>`;
    } else {
      contentHTML = transcriptText.replace(
        /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g,
        '<span style="color:#A100FF; font-weight:600; margin-right:8px;">[$1]</span>'
      );
    }

    panel.innerHTML = `
      <style>
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #summatube-panel::-webkit-scrollbar {
          width: 6px;
        }
        #summatube-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        #summatube-panel::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        #summatube-panel::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      </style>

      <div style="${headerStyle}">
        <div>
          <div style="${titleStyle}">SummaTube</div>
          <div style="${subtitleStyle}">Video Transcript</div>
        </div>
        <button style="
          background:none;
          border:none;
          color:white;
          font-size:32px;
          cursor:pointer;
          width:40px;
          height:40px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.2)'"
          onmouseout="this.style.background='none'">×</button>
      </div>
      <div style="${contentStyle}">${contentHTML}</div>
    `;

    panel.querySelector('button').onclick = () => {
      panel.style.animation = 'slideDown 0.3s ease-in';
      setTimeout(() => panel.remove(), 300);
    };

    sidebar.insertBefore(panel, sidebar.firstChild);

    // Add fade-out animation for removal
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
    document.head.appendChild(style);
  }

  async function run() {
    if (!getVideoId()) return;

    showPanel('loading');

    const transcript = await fetchTranscript();
    showPanel(transcript || null);
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById('secondary') || document.querySelector('#related')) {
      observer.disconnect();
      setTimeout(run, 1200);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.getElementById('secondary') || document.querySelector('#related')) {
    setTimeout(run, 1200);
  }
})();