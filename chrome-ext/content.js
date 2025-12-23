// SummaTube - With AI Summary Button (External styles.css)

(function () {
  'use strict';

  // Inject external stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(link);

  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  let currentVideoId = null;
  let summaryCache = null; // Cache summary per video
  let openaiApiKey = null;

  // API Key management
  async function getApiKey() {
    if (openaiApiKey) return openaiApiKey;
    const result = await chrome.storage.sync.get(['openaiApiKey']);
    openaiApiKey = result.openaiApiKey;
    return openaiApiKey;
  }

  async function setApiKey(key) {
    openaiApiKey = key;
    await chrome.storage.sync.set({ openaiApiKey: key });
  }

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
    try {
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

      const fullTranscript = segmentData.map(s => s.text).join(' ');

      return { chunks, fullTranscript };
    } catch (error) {
      // Silently handle transcript fetching errors
      document.querySelector('button[aria-label*="Close transcript" i]')?.click();
      return null;
    }
  }

  function seekTo(seconds) {
    const player = document.querySelector('video');
    if (player) {
      player.currentTime = seconds;
      player.play();
    }
  }

  async function getSummary(videoId, transcript) {
    if (summaryCache && summaryCache.video_id === videoId) {
      return summaryCache;
    }

    const apiKey = await getApiKey();
    if (!apiKey) {
      return { error: 'Please set your OpenAI API key first.' };
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes YouTube video transcripts. Provide a concise but comprehensive summary of the video content, highlighting the main points and key takeaways.'
            },
            {
              role: 'user',
              content: `Please summarize this YouTube video transcript:\n\n${transcript}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content || 'No summary generated';

      const result = {
        title: `Video Summary`,
        summary: summary,
        video_id: videoId
      };

      summaryCache = result;
      return result;
    } catch (err) {
      console.error('OpenAI API error:', err);
      return { error: `Failed to generate summary: ${err.message}` };
    }
  }

  function createPanel(data) {
    document.getElementById('summatube-panel')?.remove();

    const sidebar = document.getElementById('secondary') || document.querySelector('#related');
    if (!sidebar) return;

    currentVideoId = getVideoId();

    const panel = document.createElement('div');
    panel.id = 'summatube-panel';

    const isDark = document.documentElement.hasAttribute('dark') ||
                   document.body.classList.contains('ytd-watch-flexy--dark-theme');
    panel.classList.add(isDark ? 'dark' : 'light');

    // Transcript chunks
    let transcriptHTML = '';
    if (!data) {
      transcriptHTML = `
        <div class="status-text">
          <div class="emoji">📜</div>
          <div>No transcript available.</div>
        </div>`;
    } else if (data === 'loading') {
      transcriptHTML = `
        <div class="status-text">
          <div class="emoji">⏳</div>
          <div>Loading transcript...</div>
        </div>`;
    } else {
      transcriptHTML = data.chunks.map(chunk => {
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

    // Summary section (only if transcript exists)
    const hasTranscript = data && data.fullTranscript;
    let summarySection = '';

    if (hasTranscript) {
      summarySection = `
        <div class="summary-section">
          <div id="summatube-api-key-section" class="api-key-section" style="display:none;">
            <div class="api-key-input-group">
              <input type="password" id="summatube-api-key-input" class="api-key-input"
                     placeholder="Enter your OpenAI API key">
              <button id="summatube-save-api-key-btn" class="save-api-key-btn">Save Key</button>
            </div>
            <div class="api-key-help">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" class="api-link">OpenAI Platform</a>
            </div>
          </div>
          <div id="summatube-summary-controls">
            <button id="summatube-summary-btn" class="summary-btn">
              ✨ Generate AI Summary
            </button>
            <button id="summatube-api-key-btn" class="api-key-btn">🔑 Set API Key</button>
          </div>
          <div id="summatube-summary-result" class="summary-result" style="display:none;"></div>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="summatube-header ${isDark ? 'dark' : 'light'}">
        <div>
          <div class="header-title">SummaTube</div>
          <div class="header-subtitle">Transcript + AI Summary</div>
        </div>
        <button id="summatube-toggle-btn">−</button>
      </div>
      <div class="summatube-content ${isDark ? 'dark' : 'light'}">
        ${transcriptHTML}
        ${summarySection}
      </div>
    `;

    // Toggle minimize
    const toggleBtn = panel.querySelector('#summatube-toggle-btn');
    const contentDiv = panel.querySelector('.summatube-content');
    const headerDiv = panel.querySelector('.summatube-header');

    function togglePanel() {
      panel.classList.toggle('minimized');
      toggleBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
      if (!panel.classList.contains('minimized')) contentDiv.scrollTop = 0;
    }

    toggleBtn.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
    headerDiv.addEventListener('click', togglePanel);

    // Timestamp seek
    panel.querySelectorAll('.summatube-seek').forEach(el => {
      el.addEventListener('click', () => seekTo(parseInt(el.dataset.seconds, 10)));
    });

    // AI Summary Button
    const summaryBtn = panel.querySelector('#summatube-summary-btn');
    const summaryResult = panel.querySelector('#summatube-summary-result');

    if (summaryBtn && hasTranscript) {
      summaryBtn.addEventListener('click', async () => {
        summaryBtn.disabled = true;
        summaryBtn.innerHTML = '⏳ Generating...';

        const result = await getSummary(currentVideoId, data.fullTranscript);

        if (result.error) {
          summaryResult.innerHTML = `<div class="error-text">⚠️ ${result.error}</div>`;
        } else {
          summaryResult.innerHTML = `
            <div class="summary-card">
              <div class="summary-title">✨ AI Summary</div>
              <div class="summary-body">${result.summary}</div>
              <div class="summary-footer">
                Powered by OpenAI GPT-3.5
              </div>
            </div>
          `;
        }

        summaryResult.style.display = 'block';
        summaryBtn.style.display = 'none';
      });
    }

    // API Key Management
    const apiKeyBtn = panel.querySelector('#summatube-api-key-btn');
    const apiKeySection = panel.querySelector('#summatube-api-key-section');
    const apiKeyInput = panel.querySelector('#summatube-api-key-input');
    const saveApiKeyBtn = panel.querySelector('#summatube-save-api-key-btn');
    const summaryControls = panel.querySelector('#summatube-summary-controls');

    if (apiKeyBtn && apiKeySection && summaryControls) {
      // Check if API key is already set
      getApiKey().then(key => {
        if (key) {
          apiKeyBtn.style.display = 'none';
        } else {
          apiKeyBtn.style.display = 'inline-block';
        }
      });

      apiKeyBtn.addEventListener('click', () => {
        apiKeySection.style.display = 'block';
        summaryControls.style.display = 'none';
        apiKeyInput.focus();
      });

      saveApiKeyBtn.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (key) {
          await setApiKey(key);
          apiKeySection.style.display = 'none';
          summaryControls.style.display = 'block';
          apiKeyBtn.style.display = 'none';

          // Clear input for security
          apiKeyInput.value = '';
        }
      });

      // Allow Enter key to save
      apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          saveApiKeyBtn.click();
        }
      });
    }

    sidebar.insertBefore(panel, sidebar.firstChild);
  }

  async function run() {
    const videoId = getVideoId();
    if (!videoId) return;

    createPanel('loading');

    const result = await fetchTranscript();
    createPanel(result || null);
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