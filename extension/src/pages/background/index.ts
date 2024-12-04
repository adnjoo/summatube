import { parseUrlHash, supabase } from '@/helpers';

const OPTIONS_URL =
  'chrome-extension://pflnhnplhknlnolfdadeggidfblffipc/src/pages/options/index.html';

// Redirect to panel
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: OPTIONS_URL });
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
    await chrome.storage.local.set({ session: data.session, refresh_token });

    // Redirect to a friendly page
    chrome.tabs.update({
      url: OPTIONS_URL,
    });

    console.log('OAuth callback handled successfully.');
  } catch (error: any) {
    console.error('Error during OAuth callback:', error.message);
  }
}

// Redirect on click if user is not authenticated
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background script:', message);
  if (message.type === 'GREETING') {
    chrome.tabs.create({ url: OPTIONS_URL });
  }
  // Return true to indicate that you will send a response asynchronously
  return true;
});

// async function refreshToken() {
//   try {
//     const { refresh_token, expires_at } =
//       (await chrome.storage.local.get(['refresh_token', 'expires_at'])) || {};
//     if (!refresh_token) {
//       throw new Error('No refresh token found.');
//     }

//     // Refresh token if it’s about to expire in the next 5 minutes
//     if (Date.now() > expires_at - 5 * 60 * 1000) {
//       console.log('Refreshing token...');
//       const { data, error } = await supabase.auth.refreshSession({
//         refresh_token,
//       });
//       if (error) throw error;

//       // Update storage with the new tokens
//       await chrome.storage.local.set({
//         session: data.session,
//         refresh_token: data.session.refresh_token,
//         expires_at: Date.now() + data.session.expires_in * 1000, // Update expiration time
//       });

//       console.log('Token refreshed successfully.');
//     }
//   } catch (error: any) {
//     console.error('Error refreshing token:', error.message);
//   }
// }

// // Set an interval to check and refresh the token
// setInterval(refreshToken, 5 * 60 * 1000); // Run every 5 minutes

// Enable service worker in the background script (required for Manifest V3)
export {};
