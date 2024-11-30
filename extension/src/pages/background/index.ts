// Listen for navigation events on YouTube
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url && details.url.includes('youtube.com/watch')) {
    console.log('Navigation detected:', details.url);
    // Send a message to the content script to trigger initialization
    chrome.tabs.sendMessage(details.tabId!, { action: 'initialize' });
  }
});

// Enable service worker in the background script (required for Manifest V3)
export {};
