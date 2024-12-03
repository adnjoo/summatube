import { createRoot } from 'react-dom/client';
import '@/globals.css';
import TranscriptSummaryUI from './TranscriptSummaryUI';

let reactRoot: ReturnType<typeof createRoot> | null = null; // Keep track of the React root

const initializeReactApp = () => {
  const secondarySection = document.querySelector('#secondary');

  if (!secondarySection) {
    console.error("Can't find the secondary section element");
    return;
  }

  // Check if the app container already exists
  let appContainer = document.querySelector('#__root');
  if (!appContainer) {
    // If not, create a new one
    appContainer = document.createElement('div');
    appContainer.id = '__root';
    secondarySection.prepend(appContainer);
  } else {
    // If it exists, unmount the previous React root
    if (reactRoot) {
      console.log('Unmounting old React root...');
      reactRoot.unmount();
    }
  }

  console.log('Injecting React app...');
  reactRoot = createRoot(appContainer); // Create a new React root
  reactRoot.render(<TranscriptSummaryUI />);
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'initialize') {
    console.log('Received initialize message. Initializing app...');
    initializeReactApp();
  }
});

// Initial check (in case the page is already loaded)
initializeReactApp();
