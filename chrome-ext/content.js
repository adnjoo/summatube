// SummaTube - Minimizable Chunked Transcript Panel (December 2025)

(function () {
  'use strict';

  function getVideoId() {
    return new URLSearchParams(window.location.search).get('v');
  }

  function timestampToSeconds(ts) {
    if (!ts) return 0;
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  function secondsToTimestamp(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  async function fetchTranscript() {
    const button = document.querySelector('button[aria-label*="transcript" i], button[aria-label*="Transcript" i]');
    if (!button) return null;

    button.click();
    await new Promise(r => setTimeout(r, 2000));

    const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
    if (segments.length === 0) {
      document.querySelector('button[aria-label*="Close transcript" i]')?.click();
      return null;
    }

    const segmentData = Array.from(segments).map(segment => {
      const timeEl = segment.querySelector('[class*="timestamp"], .cue-group-start-offset');
      const textEl = segment.querySelector('[class*="text"], .cue, yt-formatted-string');
      const time = timeEl?.textContent.trim() || '';
      const text = textEl?.textContent.trim() || '';
      return { time, text, seconds: timestampToSeconds(time) };
    }).filter(s => s.text);

    document.querySelector('button[aria-label*="Close transcript" i]')?.click();

    const chunks = [];
    let currentChunk = { startSeconds: 0, endSeconds: 0, texts: [] };

    segmentData.forEach((seg, i) => {
      if (currentChunk.texts.length === 0) currentChunk.startSeconds = seg.seconds;
      currentChunk.texts.push(seg.text);
      currentChunk.endSeconds = seg.seconds;

      if (currentChunk.endSeconds - currentChunk.startSeconds >= 30 || i === segmentData.length - 1) {
        chunks.push({ ...currentChunk });
        currentChunk = { startSeconds: seg.seconds, endSeconds: seg.seconds, texts: [] };
      }
    });

    return chunks;
  }

  function seekTo(seconds) {
    const player = document.querySelector('video');
    if (player) {
      player.currentTime = seconds;
      player.play(); // Optional: auto-play after seek
      return;
    }
    const url = new URL(window.location);
    url.searchParams.set('t', Math.floor(seconds) + 's');
    window.history.replaceState(null, '', url);
    const video = document.querySelector('video');
    if (video) video.currentTime = seconds;
  }

  function createPanel(chunks) {
    // Remove existing panel if any
    document.getElementById('summatube-panel')?.remove();

    const sidebar = document.getElementById('secondary') || document.querySelector('#related');
    if (!sidebar) return;

    const panel = document.createElement('div');
    panel.id = 'summatube-panel';
    panel.style.cssText = `
      margin: 20px 0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      font-family: "Roboto", "YouTube Sans", sans-serif;
      max-width: 400px;
      transition: all 0.3s ease;
    `;

    const isDark = document.documentElement.hasAttribute('dark') ||
                   document.body.classList.contains('ytd-watch-flexy--dark-theme');

    const bgColor = isDark ? 'rgba(15,15,15,0.85)' : 'rgba(255,255,255,0.92)';
    const textColor = isDark ? '#e0e0e0' : '#0f0f0f';
    const secondaryText = isDark ? '#aaaaaa' : '#606060';
    const headerGradient = isDark 
      ? 'linear-gradient(135deg, #8B00FF, #FF006E)' 
      : 'linear-gradient(135deg, #A100FF, #FF3578)';

    const headerStyle = `
      background: ${headerGradient};
      padding: 18px 20px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 15px rgba(139,0,255,0.3);
      cursor: pointer;
    `;

    const contentStyle = `
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;
      background: ${bgColor};
      color: ${textColor};
      font-size: 14.5px;
      line-height: 1.7;
      transition: max-height 0.4s ease, padding 0.3s ease, opacity 0.3s ease;
      scrollbar-width: thin;
      scrollbar-color: #888 transparent;
    `;

    let contentHTML = '';
    if (!chunks) {
      contentHTML = `<div style="text-align:center; padding:60px 20px; color:${secondaryText}; font-style:italic;">
        <div style="font-size:48px; margin-bottom:16px; opacity:0.3;">📜</div>
        <div>No transcript available.</div>
      </div>`;
    } else if (chunks === 'loading') {
      contentHTML = `<div style="text-align:center; padding:60px 20px; color:${secondaryText};">
        <div style="font-size:48px; margin-bottom:16px;">⏳</div>
        <div>Loading transcript...</div>
      </div>`;
    } else {
      contentHTML = chunks.map(chunk => {
        const startTs = secondsToTimestamp(chunk.startSeconds);
        const endTs = secondsToTimestamp(chunk.endSeconds);
        const paragraph = chunk.texts.join(' ');
        return `
          <div style="margin-bottom: 24px; padding: 16px; background: rgba(139,0,255,0.08); border-radius: 12px; border-left: 4px solid #A100FF;">
            <div style="font-weight: 600; color: #A100FF; cursor: pointer; margin-bottom: 8px;"
                 class="summatube-seek" data-seconds="${chunk.startSeconds}">
              [${startTs} – ${endTs}]
            </div>
            <div>${paragraph}</div>
          </div>`;
      }).join('');
    }

    panel.innerHTML = `
      <style>
        #summatube-panel.minimized .summatube-content { max-height: 0; padding: 0 20px; opacity: 0; }
        #summatube-panel.minimized { border-radius: 16px; }
        .summatube-seek:hover { text-decoration: underline; }
        #summatube-panel::-webkit-scrollbar { width: 6px; }
        #summatube-panel::-webkit-scrollbar-track { background: transparent; }
        #summatube-panel::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
        #summatube-panel::-webkit-scrollbar-thumb:hover { background: #aaa; }
      </style>

      <div class="summatube-header" style="${headerStyle}">
        <div>
          <div style="font-size:20px; font-weight:600;">SummaTube</div>
          <div style="font-size:13px; opacity:0.9; margin-top:2px;">Chunked Transcript (30s)</div>
        </div>
        <button id="summatube-toggle-btn" style="
          background:none; border:none; color:white; font-size:32px; cursor:pointer;
          width:40px; height:40px; border-radius:50%; display:flex; align-items:center;
          justify-content:center; transition: background 0.2s, transform 0.3s;">
          −
        </button>
      </div>
      <div class="summatube-content" style="${contentStyle}">${contentHTML}</div>
    `;

    // Toggle minimize / expand
    const toggleBtn = panel.querySelector('#summatube-toggle-btn');
    const contentDiv = panel.querySelector('.summatube-content');
    const headerDiv = panel.querySelector('.summatube-header');

    function togglePanel() {
      panel.classList.toggle('minimized');
      if (panel.classList.contains('minimized')) {
        toggleBtn.textContent = '+';
        toggleBtn.style.transform = 'rotate(0deg)';
      } else {
        toggleBtn.textContent = '−';
        toggleBtn.style.transform = 'rotate(180deg)';
        contentDiv.scrollTop = 0; // Optional: scroll to top when expanding
      }
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel();
    });

    headerDiv.addEventListener('click', togglePanel); // Click header to expand too

    // Seek functionality
    panel.querySelectorAll('.summatube-seek').forEach(el => {
      el.addEventListener('click', () => {
        const seconds = parseInt(el.dataset.seconds, 10);
        seekTo(seconds);
      });
    });

    sidebar.insertBefore(panel, sidebar.firstChild);
  }

  async function run() {
    if (!getVideoId()) return;

    createPanel('loading');

    const chunks = await fetchTranscript();
    createPanel(chunks || null);
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