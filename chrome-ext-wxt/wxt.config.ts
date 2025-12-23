import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist',
  manifest: {
    name: 'SummaTube - YouTube Transcript & Summary',
    version: '1.0.0',
    description: 'Automatically extracts and displays YouTube video transcripts in sidebar',
    icons: {
      '16': '/icon16.png',
      '48': '/icon48.png',
      '128': '/icon128.png'
    },
    permissions: [
      'activeTab',
      'storage'
    ],
    host_permissions: [
      'https://api.openai.com/*'
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
      content_scripts: "script-src 'self'; object-src 'self'; connect-src https://api.openai.com/"
    }
  },
  runner: {
    startUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  },
});
