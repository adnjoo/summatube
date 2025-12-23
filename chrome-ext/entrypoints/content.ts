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
    let transcriptSegments: TranscriptSegment[] = [];
    let playbackTrackingInterval: number | null = null;
    let currentActiveIndex: number = -1;
    let autoScrollEnabled: boolean = true;

    // Types
    interface TranscriptSegment {
      time: string;
      text: string;
      seconds: number;
    }

    interface TranscriptData {
      segments: TranscriptSegment[];
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

        const fullTranscript = segmentData.map(s => s.text).join(' ');

        return { segments: segmentData, fullTranscript };
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

    function startPlaybackTracking(): void {
      if (playbackTrackingInterval) {
        clearInterval(playbackTrackingInterval);
      }

      playbackTrackingInterval = window.setInterval(() => {
        const player = document.querySelector('video') as HTMLVideoElement;
        if (!player || transcriptSegments.length === 0) return;

        const currentTime = player.currentTime;
        
        // Find the active segment
        let activeIndex = -1;
        for (let i = transcriptSegments.length - 1; i >= 0; i--) {
          if (currentTime >= transcriptSegments[i].seconds) {
            activeIndex = i;
            break;
          }
        }

        // Update active segment if changed
        if (activeIndex !== currentActiveIndex) {
          currentActiveIndex = activeIndex;
          updateActiveSegment(activeIndex);
        }
      }, 100);
    }

    function stopPlaybackTracking(): void {
      if (playbackTrackingInterval) {
        clearInterval(playbackTrackingInterval);
        playbackTrackingInterval = null;
      }
    }

    function updateActiveSegment(index: number): void {
      const transcriptList = document.getElementById('summatube-transcript-list');
      if (!transcriptList) return;

      // Remove previous active class
      transcriptList.querySelectorAll('.transcript-line').forEach((line, i) => {
        line.classList.remove('active');
        if (i === index) {
          line.classList.add('active');
          // Auto-scroll to active line only if enabled
          if (autoScrollEnabled) {
            line.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    }

    async function loadAutoScrollPreference(): Promise<void> {
      const result = await chrome.storage.sync.get(['autoScrollEnabled']);
      autoScrollEnabled = result.autoScrollEnabled !== undefined ? result.autoScrollEnabled : true;
    }

    async function toggleAutoScroll(): Promise<void> {
      autoScrollEnabled = !autoScrollEnabled;
      await chrome.storage.sync.set({ autoScrollEnabled });
      updateAutoScrollButton();
    }

    function updateAutoScrollButton(): void {
      const btn = document.getElementById('summatube-auto-scroll-btn') as HTMLButtonElement;
      if (!btn) return;
      
      btn.classList.toggle('disabled', !autoScrollEnabled);
      btn.title = autoScrollEnabled ? 'Disable auto-scroll' : 'Enable auto-scroll';
      
      // Update icon based on state
      const svg = btn.querySelector('svg');
      if (svg) {
        if (autoScrollEnabled) {
          // Scroll down icon (enabled)
          svg.innerHTML = '<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>';
        } else {
          // Lock/disabled icon
          svg.innerHTML = '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>';
        }
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

    async function createPanel(data: TranscriptData | 'loading' | null): Promise<void> {
      document.getElementById('summatube-panel')?.remove();
      stopPlaybackTracking();

      const sidebar = document.getElementById('secondary') || document.querySelector('#related');
      if (!sidebar) return;

      currentVideoId = getVideoId();

      const panel = document.createElement('div');
      panel.id = 'summatube-panel';

      const isDark = document.documentElement.hasAttribute('dark') ||
                     document.body.classList.contains('ytd-watch-flexy--dark-theme');
      panel.classList.add(isDark ? 'dark' : 'light');

      // Store segments for playback tracking
      if (data && data !== 'loading') {
        transcriptSegments = data.segments;
      } else {
        transcriptSegments = [];
      }

      // Transcript list - line by line
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
        transcriptHTML = data.segments.map((segment, index) => {
          return `
            <div class="transcript-line" data-index="${index}" data-seconds="${segment.seconds}">
              <div class="transcript-line-content">
                <span class="play-icon">▶</span>
                <span class="transcript-text">${segment.text}</span>
              </div>
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
          <div class="header-left">
            <div class="header-title">SummaTube</div>
          </div>
          <div class="header-right">
            <button id="summatube-auto-scroll-btn" class="header-icon-btn" title="Toggle auto-scroll">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>
            <button id="summatube-settings-btn" class="header-icon-btn" title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>
            <button id="summatube-close-btn" class="header-icon-btn" title="Minimize">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="summatube-tabs">
          <button class="tab-button active" data-tab="subtitles">Subtitles</button>
        </div>
        <div class="summatube-content ${isDark ? 'dark' : 'light'}">
          <div id="summatube-transcript-list" class="transcript-list">
            ${transcriptHTML}
          </div>
          ${summarySection}
        </div>
      `;

      // Load auto-scroll preference and update button
      await loadAutoScrollPreference();
      
      // Close/Minimize button
      const closeBtn = panel.querySelector('#summatube-close-btn') as HTMLButtonElement;
      const updateMinimizeIcon = () => {
        const svg = closeBtn.querySelector('svg');
        if (svg) {
          if (panel.classList.contains('minimized')) {
            svg.innerHTML = '<path d="M19 13H5v-2h14v2z"/>';
            closeBtn.title = 'Expand';
          } else {
            svg.innerHTML = '<path d="M19 13H5v-2h14v2z"/>';
            closeBtn.title = 'Minimize';
          }
        }
      };

      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('minimized');
        updateMinimizeIcon();
        if (panel.classList.contains('minimized')) {
          stopPlaybackTracking();
        } else {
          // Restart tracking if transcript is loaded
          if (data && data !== 'loading' && transcriptSegments.length > 0) {
            startPlaybackTracking();
          }
        }
      });

      // Click header to expand when minimized
      const headerDiv = panel.querySelector('.summatube-header') as HTMLElement;
      headerDiv.addEventListener('click', (e) => {
        // Don't expand if clicking on buttons
        if ((e.target as HTMLElement).closest('.header-icon-btn')) {
          return;
        }
        if (panel.classList.contains('minimized')) {
          panel.classList.remove('minimized');
          updateMinimizeIcon();
          // Restart tracking if transcript is loaded
          if (data && data !== 'loading' && transcriptSegments.length > 0) {
            startPlaybackTracking();
          }
        }
      });

      // Auto-scroll toggle button
      const autoScrollBtn = panel.querySelector('#summatube-auto-scroll-btn') as HTMLButtonElement;
      if (autoScrollBtn) {
        updateAutoScrollButton();
        autoScrollBtn.addEventListener('click', async () => {
          await toggleAutoScroll();
        });
      }

      // Get all elements once
      const settingsBtn = panel.querySelector('#summatube-settings-btn') as HTMLButtonElement;
      const apiKeySection = panel.querySelector('#summatube-api-key-section') as HTMLElement;
      const summaryControls = panel.querySelector('#summatube-summary-controls') as HTMLElement;
      const apiKeyBtn = panel.querySelector('#summatube-api-key-btn') as HTMLButtonElement;
      const apiKeyInput = panel.querySelector('#summatube-api-key-input') as HTMLInputElement;
      const saveApiKeyBtn = panel.querySelector('#summatube-save-api-key-btn') as HTMLButtonElement;
      const summaryBtn = panel.querySelector('#summatube-summary-btn') as HTMLButtonElement;
      const summaryResult = panel.querySelector('#summatube-summary-result') as HTMLElement;

      // Settings button (show API key management)
      if (settingsBtn && apiKeySection && summaryControls) {
        settingsBtn.addEventListener('click', () => {
          const isVisible = apiKeySection.style.display === 'block';
          apiKeySection.style.display = isVisible ? 'none' : 'block';
          summaryControls.style.display = isVisible ? 'block' : 'none';
        });
      }

      // Timestamp seek - click on transcript line
      panel.querySelectorAll('.transcript-line').forEach(el => {
        el.addEventListener('click', () => {
          const seconds = parseFloat((el as HTMLElement).dataset.seconds || '0');
          seekTo(seconds);
        });
      });

      // AI Summary Button
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

      // Start playback tracking if transcript is loaded
      if (data && data !== 'loading' && transcriptSegments.length > 0) {
        startPlaybackTracking();
      }
    }

    async function run(): Promise<void> {
      const videoId = getVideoId();
      if (!videoId) return;

      await createPanel('loading');

      const result = await fetchTranscript();
      await createPanel(result || null);
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
