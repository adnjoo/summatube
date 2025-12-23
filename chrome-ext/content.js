// SummaTube - External styles.css version (Clean & Professional)

(function () {
  'use strict';

  // Inject external stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(link);

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
      player.play();
    }
  }

  function createPanel(chunks) {
    document.getElementById('summatube-panel')?.remove();

    const sidebar = document.getElementById('secondary') || document.querySelector('#related');
    if (!sidebar) return;

    const panel = document.createElement('div');
    panel.id = 'summatube-panel';

    const isDark = document.documentElement.hasAttribute('dark') ||
                   document.body.classList.contains('ytd-watch-flexy--dark-theme');

    // Apply theme class
    panel.classList.add(isDark ? 'dark' : 'light');

    let contentHTML = '';
    if (!chunks) {
      contentHTML = `
        <div class="status-text">
          <div class="emoji">📜</div>
          <div>No transcript available.</div>
        </div>`;
    } else if (chunks === 'loading') {
      contentHTML = `
        <div class="status-text">
          <div class="emoji">⏳</div>
          <div>Loading transcript...</div>
        </div>`;
    } else {
      contentHTML = chunks.map(chunk => {
        const startTs = secondsToTimestamp(chunk.startSeconds);
        const endTs = secondsToTimestamp(chunk.endSeconds);
        const paragraph = chunk.texts.join(' ');
        return `
          <div class="chunk">
            <div class="timestamp summatube-seek" data-seconds="${chunk.startSeconds}">
              [${startTs} – ${endTs}]
            </div>
            <div>${paragraph}</div>
          </div>`;
      }).join('');
    }

    panel.innerHTML = `
      <div class="summatube-header ${isDark ? 'dark' : 'light'}">
        <div>
          <div style="font-size:20px; font-weight:600;">SummaTube</div>
          <div style="font-size:13px; opacity:0.9; margin-top:2px;">Chunked Transcript (30s)</div>
        </div>
        <button id="summatube-toggle-btn">−</button>
      </div>
      <div class="summatube-content ${isDark ? 'dark' : 'light'}">
        ${contentHTML}
      </div>
    `;

    const toggleBtn = panel.querySelector('#summatube-toggle-btn');
    const contentDiv = panel.querySelector('.summatube-content');
    const headerDiv = panel.querySelector('.summatube-header');

    function togglePanel() {
      panel.classList.toggle('minimized');
      toggleBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
      if (!panel.classList.contains('minimized')) {
        contentDiv.scrollTop = 0;
      }
    }

    toggleBtn.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
    headerDiv.addEventListener('click', togglePanel);

    panel.querySelectorAll('.summatube-seek').forEach(el => {
      el.addEventListener('click', () => {
        seekTo(parseInt(el.dataset.seconds, 10));
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