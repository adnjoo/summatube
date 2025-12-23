// content.js - SummaTube: Sidebar Transcript Display with Tailwind CSS v4 via Browser CDN (Dec 2025)

(function () {
  'use strict';

  function getYouTubeVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  async function getTranscript() {
    try {
      const transcriptSelectors = [
        "ytd-video-description-transcript-section-renderer button",
        "button[aria-label*='transcript']",
        "button[aria-label*='Transcript']",
        "button[aria-label*='transcrição']",
        "button[aria-label*='transcripción']",
        "[aria-label*='Show transcript']",
        "[aria-label*='Mostrar transcrição']",
        "[aria-label*='Mostrar transcripción']"
      ];

      let transcriptButton = null;
      for (const selector of transcriptSelectors) {
        transcriptButton = document.querySelector(selector);
        if (transcriptButton) break;
      }

      if (!transcriptButton) {
        return null;
      }

      transcriptButton.click();
      await new Promise(r => setTimeout(r, 1500));

      const segmentSelectors = ["ytd-transcript-segment-renderer", ".ytd-transcript-segment-renderer"];
      let segments = [];
      for (const selector of segmentSelectors) {
        segments = document.querySelectorAll(selector);
        if (segments.length > 0) break;
      }

      if (segments.length === 0) {
        return null;
      }

      const lines = Array.from(segments).map(segment => {
        const textEl = segment.querySelector("[class*='segment-text'], .cue, .cue-group__cue, #content, #text");
        const timeEl = segment.querySelector("[class*='segment-timestamp'], [class*='cue-group-start-offset'], #timestamp");

        const text = textEl ? textEl.textContent.trim() : '';
        const time = timeEl ? timeEl.textContent.trim() : '';

        return time ? `[${time}] ${text}` : text;
      }).filter(line => line.length > 0);

      const transcript = lines.join('\n\n');

      const closeBtn = document.querySelector('button[aria-label*="Close transcript"], button[aria-label*="Fechar"], button[aria-label*="Cerrar"]');
      if (closeBtn) closeBtn.click();

      return transcript;

    } catch (error) {
      console.error('SummaTube: Error getting transcript', error);
      return null;
    }
  }

  function createPanel(transcript) {
    document.querySelector('.summatube-panel')?.remove();

    const sidebar = document.getElementById('secondary') || document.querySelector('#related, [id*="secondary"]');
    if (!sidebar) {
      console.error('SummaTube: Sidebar not found');
      return;
    }

    // Create shadow container to isolate Tailwind styles
    const shadowHost = document.createElement('div');
    shadowHost.className = 'summatube-panel-host';
    const shadow = shadowHost.attachShadow({ mode: 'open' });

    // Inject Tailwind Browser CDN script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4';
    script.type = 'module';
    shadow.appendChild(script);

    // Panel HTML using Tailwind classes
    const panelHTML = `
      <div class="max-w-md mx-auto">
        <div class="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold">📝 SummaTube</h3>
            <p class="text-sm opacity-90">Video Transcript</p>
          </div>
          <button id="summatube-close" class="text-white hover:opacity-80 text-2xl">✕</button>
        </div>
        <div class="bg-white p-4 rounded-b-xl max-h-96 overflow-y-auto shadow-lg">
          ${transcript ? 
            `<pre class="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">${transcript}</pre>` :
            `<div class="text-center py-12 text-gray-500">
              <div class="text-5xl mb-4">📭</div>
              <h4 class="text-lg font-medium mb-2">No Transcript Available</h4>
              <p class="text-sm">This video does not have captions or auto-generated subtitles enabled.</p>
            </div>`
          }
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = panelHTML;
    shadow.appendChild(container);

    // Close button
    const closeBtn = shadow.getElementById('summatube-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => shadowHost.remove());
    }

    sidebar.insertBefore(shadowHost, sidebar.firstChild);
  }

  async function main() {
    if (!getYouTubeVideoId()) return;

    createPanel('Loading transcript...');

    const transcript = await getTranscript();

    createPanel(transcript);
  }

  const observer = new MutationObserver(() => {
    const sidebar = document.getElementById('secondary') || document.querySelector('#related');
    if (sidebar) {
      observer.disconnect();
      setTimeout(main, 1500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    observer.disconnect();
    if (!document.querySelector('.summatube-panel-host')) main();
  }, 20000);
})();