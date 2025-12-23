// Content script that runs on YouTube pages
(function() {
  'use strict';

  // Extract YouTube video ID from URL
  function getYouTubeVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  // Fetch transcript from YouTube's internal API
  async function fetchYouTubeTranscript(videoId) {
    try {
      console.log('Fetching transcript for video:', videoId);

      // For now, we'll simulate transcript fetching with a delay
      // This demonstrates the loading state and eventual success
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

      // This is a simplified approach - in practice, you'd need to handle YouTube's actual transcript API
      // YouTube stores transcripts in their internal API, but accessing it requires specific handling
      // Real implementation would need proper YouTube API integration or scraping
      const mockTranscript = `Welcome to this YouTube video. Today we're going to explore an interesting topic that many people find fascinating.

      This video covers several key points that are important to understand. First, we'll discuss the background and context of the subject matter. Then we'll dive into the main concepts and ideas that drive this topic forward.

      Throughout the video, we'll examine real-world examples and practical applications. These examples help illustrate how these concepts work in practice and why they matter in our daily lives.

      By the end of this video, you'll have a comprehensive understanding of the topic and be able to apply these concepts in your own work or personal projects. Remember to like, subscribe, and hit the notification bell for more content like this.`;

      return mockTranscript;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }

  // Send transcript to summarization API
  async function summarizeTranscript(transcript, videoId) {
    try {
      console.log('Sending transcript to API for summarization...');

      // For now, try the API call but fall back to mock data if it fails
      const response = await fetch('http://localhost:3001/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript,
          video_id: videoId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API response received:', result);
      return result;
    } catch (error) {
      console.error('Error summarizing transcript:', error);
      console.log('Falling back to mock summary...');

      // Mock summary for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
      return {
        title: 'Mock Video Title',
        summary: 'This is a mock AI-generated summary. The API server is not currently running. To get real summaries, please start the Next.js development server with: cd web && npm run dev',
        transcript: transcript,
        video_id: videoId
      };
    }
  }

  // Create and show the transcript panel in the secondary div
  function showTranscriptPanel(transcript, summary, videoId) {
    console.log('Showing panel with transcript length:', transcript?.length, 'summary:', summary);

    // Remove any existing SummaTube panel
    const existingPanel = document.querySelector('.summatube-panel');
    if (existingPanel) {
      console.log('Removing existing panel');
      existingPanel.remove();
    }

    // Get the secondary div (try multiple selectors)
    let secondaryDiv = document.getElementById('secondary');
    if (!secondaryDiv) {
      // Try alternative selectors for YouTube's sidebar
      secondaryDiv = document.querySelector('#secondary, .secondary, [id*="secondary"], #sidebar, #related');
    }
    console.log('SummaTube: Looking for secondary div...', !!secondaryDiv);
    if (!secondaryDiv) {
      console.error('Secondary div not found - falling back to modal');
      console.log('SummaTube: Available secondary-like elements:');
      console.log('- #secondary:', !!document.getElementById('secondary'));
      console.log('- .secondary:', !!document.querySelector('.secondary'));
      console.log('- [id*="secondary"]:', !!document.querySelector('[id*="secondary"]'));
      console.log('- #sidebar:', !!document.getElementById('sidebar'));
      console.log('- #related:', !!document.getElementById('related'));
      showTranscriptPanel(transcript, summary, videoId);
      return;
    }

    // Create panel container
    const panel = document.createElement('div');
    panel.className = 'summatube-panel';
    panel.style.cssText = `
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 16px 0;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid #e5e7eb;
      width: 100%;
      box-sizing: border-box;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    header.innerHTML = `
      <div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">📝 SummaTube</h3>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">AI-Powered Video Analysis</p>
      </div>
      <button id="closePanel" style="
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      ">✕</button>
    `;

    // Create content area
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
    `;

    // Create content based on what we have
    let contentHTML = '';

    if (transcript === 'Loading transcript...') {
      contentHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
          <h4 style="color: #1f2937; margin-bottom: 8px; font-size: 18px;">Loading Transcript</h4>
          <p style="color: #6b7280; margin: 0;">Please wait while we fetch the video transcript...</p>
        </div>
      `;
    } else if (transcript === 'Generating AI summary...') {
      contentHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🤖</div>
          <h4 style="color: #1f2937; margin-bottom: 8px; font-size: 18px;">Generating AI Summary</h4>
          <p style="color: #6b7280; margin: 0;">Our AI is analyzing the transcript to create a summary...</p>
        </div>
        <div style="margin-top: 20px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 16px; font-weight: 600;">Transcript Preview</h4>
          <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #374151; line-height: 1.5; font-size: 14px;">${summary}</p>
          </div>
        </div>
      `;
    } else if (summary && typeof summary === 'object' && summary.summary) {
      // Full content with summary
      contentHTML = `
        <div style="margin-bottom: 16px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 16px; font-weight: 600;">🤖 AI Summary</h4>
          <div style="background: linear-gradient(135deg, #fef2f2, #fef3c7); border: 1px solid #f87171; padding: 12px; border-radius: 8px;">
            <p style="margin: 0; color: #991b1b; line-height: 1.5; font-size: 14px;">${summary.summary}</p>
          </div>
        </div>

        <div>
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 16px; font-weight: 600;">📄 Full Transcript</h4>
          <div style="background: #f9fafb; padding: 12px; border-radius: 8px; max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #374151; line-height: 1.5; font-size: 14px; white-space: pre-wrap;">${transcript}</p>
          </div>
        </div>
      `;
    } else {
      // Just transcript or error message
      contentHTML = `
        <div>
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 16px; font-weight: 600;">📄 Transcript</h4>
          <div style="background: #f9fafb; padding: 12px; border-radius: 8px; max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #374151; line-height: 1.5; font-size: 14px; white-space: pre-wrap;">${transcript}</p>
          </div>
        </div>
      `;
    }

    content.innerHTML = contentHTML;

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(content);

    // Insert at the top of secondary div
    secondaryDiv.insertBefore(panel, secondaryDiv.firstChild);
    console.log('SummaTube: Panel inserted into secondary div');

    // Add close functionality
    document.getElementById('closePanel').addEventListener('click', function() {
      panel.remove();
    });

    // Add hover effects to close button
    const closeBtn = document.getElementById('closePanel');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '1';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.opacity = '0.8';
    });
  }

  // Main function to handle transcript fetching and display
  async function handleTranscriptDisplay() {
    const videoId = getYouTubeVideoId();

    if (!videoId) {
      console.log('No video ID found in URL');
      showTranscriptPanel('Unable to find video ID. Please make sure you\'re on a valid YouTube video page.', null, null);
      return;
    }

    try {
      console.log('Starting transcript display process for video:', videoId);

      // Show loading state
      showTranscriptPanel('Loading transcript...', null, videoId);

      // Fetch transcript
      console.log('Fetching transcript...');
      const transcript = await fetchYouTubeTranscript(videoId);

      if (!transcript) {
        console.log('No transcript available');
        showTranscriptPanel('Failed to load transcript. This video may not have captions available, or the transcript service is temporarily unavailable.', null, videoId);
        return;
      }

      console.log('Transcript fetched successfully, generating summary...');
      showTranscriptPanel('Generating AI summary...', transcript, videoId);

      // Generate summary
      const summary = await summarizeTranscript(transcript, videoId);

      if (!summary) {
        console.log('Summary generation failed, showing transcript only');
        showTranscriptPanel(transcript, { summary: 'Summary generation failed. Please try again or check that the API server is running.' }, videoId);
        return;
      }

      console.log('Summary generated successfully, showing final result');
      // Show transcript and summary
      showTranscriptPanel(transcript, summary, videoId);

    } catch (error) {
      console.error('Error in handleTranscriptDisplay:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      showTranscriptPanel(`Error: ${errorMessage}. Please check the browser console for more details and ensure the API server is running.`, null, videoId);
    }
  }

  // Automatically display transcript when on YouTube video page
  function autoDisplayTranscript() {
    console.log('SummaTube: Checking if this is a YouTube video page...');

    // Check if we're on a YouTube video page
    const videoId = getYouTubeVideoId();
    if (!videoId) {
      console.log('SummaTube: Not a YouTube video page, skipping auto-display');
      return;
    }

    console.log('SummaTube: YouTube video detected, waiting for page to load...');

    // Wait for YouTube to load, then automatically show transcript
    const checkForYouTube = setInterval(() => {
      // Check if the secondary div is available (indicates page is loaded)
      const secondaryDiv = document.getElementById('secondary') ||
                          document.querySelector('.secondary, [id*="secondary"], #sidebar, #related');

      if (secondaryDiv) {
        clearInterval(checkForYouTube);
        console.log('SummaTube: YouTube page loaded, automatically displaying transcript...');

        // Automatically trigger transcript display
        handleTranscriptDisplay();
      }
    }, 1000);

    // Clear interval after 15 seconds if YouTube doesn't load
    setTimeout(() => {
      clearInterval(checkForYouTube);
      console.log('SummaTube: Auto-display timeout - page may not have loaded properly');
    }, 15000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoDisplayTranscript);
  } else {
    autoDisplayTranscript();
  }
})();
