import styles from '../styles.css?inline';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  cssInjectionMode: 'ui',

  main() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    console.log('SummaTube loaded on YouTube!');

    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    let currentVideoId: string | null = null;
    let summaryCache: any = null;
    let openaiApiKey: string | null = null;

    // Types
    interface TranscriptSegment {
      time: string;
      text: string;
      seconds: number;
    }

    interface TranscriptChunk {
      startSeconds: number;
      endSeconds: number;
      texts: string[];
    }

    interface TranscriptData {
      chunks: TranscriptChunk[];
      fullTranscript: string;
    }

    interface SummaryResult {
      title: string;
      summary: string;
      video_id: string;
      error?: string;
    }

    // API Key management
    async function getApiKey(): Promise<string | null> {
      if (openaiApiKey) return openaiApiKey;
      const result = await chrome.storage.sync.get(['openaiApiKey']);
      openaiApiKey = result.openaiApiKey;
      return openaiApiKey;
    }

    async function setApiKey(key: string): Promise<void> {
      openaiApiKey = key;
      await chrome.storage.sync.set({ openaiApiKey: key });
    }

    function getVideoId(): string | null {
      return new URLSearchParams(window.location.search).get('v');
    }

    function timestampToSeconds(ts: string): number {
      if (!ts) return 0;
      const parts = ts.split(':').map(Number);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return 0;
    }

    function secondsToTimestamp(seconds: number): string {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    async function fetchTranscript(): Promise<TranscriptData | null> {
      try {
        const button = document.querySelector('button[aria-label*="transcript" i], button[aria-label*="Transcript" i]');
        if (!button) return null;

        (button as HTMLButtonElement).click();
        await new Promise(resolve => setTimeout(resolve, 2000));

        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length === 0) {
          document.querySelector('button[aria-label*="Close transcript" i]')?.click();
          return null;
        }

        const segmentData: TranscriptSegment[] = Array.from(segments).map(segment => {
          const timeEl = segment.querySelector('[class*="timestamp"], .cue-group-start-offset');
          const textEl = segment.querySelector('[class*="text"], .cue, yt-formatted-string');
          const time = timeEl?.textContent?.trim() || '';
          const text = textEl?.textContent?.trim() || '';
          return { time, text, seconds: timestampToSeconds(time) };
        }).filter(s => s.text);

        document.querySelector('button[aria-label*="Close transcript" i]')?.click();

        const chunks: TranscriptChunk[] = [];
        let currentChunk: TranscriptChunk = { startSeconds: 0, endSeconds: 0, texts: [] };

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
        document.querySelector('button[aria-label*="Close transcript" i]')?.click();
        return null;
      }
    }

    function seekTo(seconds: number): void {
      const player = document.querySelector('video') as HTMLVideoElement;
      if (player) {
        player.currentTime = seconds;
        player.play();
      }
    }

    async function getSummary(videoId: string, transcript: string): Promise<SummaryResult> {
      if (summaryCache && summaryCache.video_id === videoId) {
        return summaryCache;
      }

      const apiKey = await getApiKey();
      if (!apiKey) {
        return { error: 'Please set your OpenAI API key first.', title: '', summary: '', video_id: '' };
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

        const result: SummaryResult = {
          title: `Video Summary`,
          summary: summary,
          video_id: videoId
        };

        summaryCache = result;
        return result;
      } catch (err) {
        console.error('OpenAI API error:', err);
        return {
          error: `Failed to generate summary: ${(err as Error).message}`,
          title: '',
          summary: '',
          video_id: ''
        };
      }
    }

    function createPanel(data: TranscriptData | 'loading' | null): void {
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
      const hasTranscript = data && data !== 'loading' && data.fullTranscript;
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
      const toggleBtn = panel.querySelector('#summatube-toggle-btn') as HTMLButtonElement;
      const contentDiv = panel.querySelector('.summatube-content') as HTMLElement;
      const headerDiv = panel.querySelector('.summatube-header') as HTMLElement;

      function togglePanel(): void {
        panel.classList.toggle('minimized');
        toggleBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
        if (!panel.classList.contains('minimized')) contentDiv.scrollTop = 0;
      }

      toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(); });
      headerDiv.addEventListener('click', togglePanel);

      // Timestamp seek
      panel.querySelectorAll('.summatube-seek').forEach(el => {
        el.addEventListener('click', () => seekTo(parseInt((el as HTMLElement).dataset.seconds!, 10)));
      });

      // AI Summary Button
      const summaryBtn = panel.querySelector('#summatube-summary-btn') as HTMLButtonElement;
      const summaryResult = panel.querySelector('#summatube-summary-result') as HTMLElement;

      if (summaryBtn && hasTranscript) {
        summaryBtn.addEventListener('click', async () => {
          summaryBtn.disabled = true;
          summaryBtn.innerHTML = '⏳ Generating...';

          const result = await getSummary(currentVideoId!, (data as TranscriptData).fullTranscript);

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
      const apiKeyBtn = panel.querySelector('#summatube-api-key-btn') as HTMLButtonElement;
      const apiKeySection = panel.querySelector('#summatube-api-key-section') as HTMLElement;
      const apiKeyInput = panel.querySelector('#summatube-api-key-input') as HTMLInputElement;
      const saveApiKeyBtn = panel.querySelector('#summatube-save-api-key-btn') as HTMLButtonElement;
      const summaryControls = panel.querySelector('#summatube-summary-controls') as HTMLElement;

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
          if ((e as KeyboardEvent).key === 'Enter') {
            saveApiKeyBtn.click();
          }
        });
      }

      sidebar.insertBefore(panel, sidebar.firstChild);
    }

    async function run(): Promise<void> {
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
  },
});
