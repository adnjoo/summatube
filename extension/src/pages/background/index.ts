import { parseUrlHash, supabase } from '@/helpers';

// Redirect to panel
chrome.action.onClicked.addListener(() => {
  console.log('Opening panel...');
  const url =
    'chrome-extension://pflnhnplhknlnolfdadeggidfblffipc/src/pages/options/index.html';

  chrome.tabs.create({ url });
});

// Listen for navigation events on YouTube
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url && details.url.includes('youtube.com/watch')) {
    console.log('Navigation detected:', details.url);
    // Send a message to the content script to trigger initialization
    chrome.tabs.sendMessage(details.tabId!, { action: 'initialize' });
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url?.startsWith(chrome.identity.getRedirectURL())) {
    handleOAuthCallback(changeInfo.url);
  }
});

/**
 * Handles the OAuth callback and saves the session.
 */
async function handleOAuthCallback(url) {
  try {
    console.log('Handling OAuth callback...');
    const hashMap = parseUrlHash(url);
    const access_token = hashMap.get('access_token');
    const refresh_token = hashMap.get('refresh_token');

    if (!access_token || !refresh_token) {
      throw new Error('Missing tokens in the redirect URL.');
    }

    // Set Supabase session
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;

    // Save session in local storage
    await chrome.storage.local.set({ session: data.session });

    // Redirect to a friendly page
    chrome.tabs.update({
      url: 'chrome-extension://pflnhnplhknlnolfdadeggidfblffipc/src/pages/panel/index.html',
    });

    console.log('OAuth callback handled successfully.');
  } catch (error: any) {
    console.error('Error during OAuth callback:', error.message);
  }
}

// Enable service worker in the background script (required for Manifest V3)
export {};
