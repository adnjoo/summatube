# SummaTube Chrome Extension

A Chrome extension that extracts YouTube video transcripts and generates AI-powered summaries using the SummaTube API.

## Features

- **Transcript Extraction**: Automatically extracts transcripts from YouTube videos
- **AI Summarization**: Generates concise summaries using OpenAI's GPT models
- **Modal Display**: Shows both transcript and summary in a clean, responsive modal
- **YouTube Integration**: Seamlessly integrates with YouTube's interface

## Files

- `manifest.json` - Extension manifest with permissions and content script configuration
- `content.js` - Main content script that handles transcript fetching and UI

## Installation

1. **Start the SummaTube web server:**
   ```bash
   cd web
   npm install
   npm run dev
   ```
   The server should run on `http://localhost:3000`

2. **Load the Chrome extension:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `chrome-ext` folder
   - The extension should now be loaded and active

## Usage

1. Navigate to any YouTube video with captions/transcripts available
2. The SummaTube panel will automatically appear in the sidebar showing the transcript and AI summary
3. No button clicking required - it displays automatically when you visit a video
4. Click the "✕" button in the panel header to close it

## Current Status

**Transcript Fetching**: Currently uses mock data for demonstration
**AI Summarization**: Falls back to mock summaries if API server is unavailable
**Sidebar Integration**: ✅ Panel appears in YouTube's secondary sidebar areang - shows transcripts and summaries in a clean interface

## Troubleshooting

### Stuck on "Loading transcript..."?

1. **Check Browser Console**: Open Developer Tools (F12) → Console tab to see error messages
2. **API Server Not Running**: The extension will show mock data if the API server isn't available
3. **Modal Not Updating**: If stuck on loading, try refreshing the page and clicking the button again

### API Server Issues

To enable real AI summaries:

1. **Start the server**:
   ```bash
   cd web
   npm install
   npm run dev
   ```

2. **Check server status**: Visit `http://localhost:3000` (or `http://localhost:3001` if port 3000 is busy)

3. **Environment setup**: Make sure you have an OpenAI API key in your environment variables

### Getting Real YouTube Transcripts

The current implementation uses mock transcripts. For real YouTube transcripts, you would need to:

1. **YouTube Data API v3**: Requires API key and handles official transcript access
2. **Third-party services**: Use transcript extraction services
3. **Browser extension permissions**: May need additional permissions for YouTube API access

## Permissions

- `activeTab` - Allows interaction with the current YouTube tab
- `storage` - For storing extension preferences
- `host_permissions` - Allows API calls to `localhost:3000` for summarization

## API Integration

The extension communicates with the SummaTube API at `http://localhost:3000/api/summarize` to:

- Send video transcripts for processing
- Receive AI-generated summaries
- Handle error responses gracefully

## Current Limitations

- **Transcript Fetching**: Currently uses a placeholder for transcript extraction. Real YouTube transcript fetching requires YouTube Data API v3 integration or handling YouTube's internal transcript endpoints.
- **Local Server**: Requires the web server to be running locally for API calls.
- **CORS**: API calls are restricted to localhost for development.

## Development

### Transcript Fetching Implementation

To implement real YouTube transcript fetching, you have several options:

1. **YouTube Data API v3**: Requires API key and handles official transcript access
2. **Internal YouTube API**: Parse YouTube's internal transcript endpoints (more complex)
3. **Third-party services**: Use services that provide transcript extraction

### Environment Setup

Make sure you have:
- Node.js installed for the web server
- OpenAI API key configured in the web app's environment variables
- Chrome extension reloaded after any code changes

### Making Changes

1. Edit `content.js` to modify UI behavior or transcript fetching logic
2. Update `manifest.json` for new permissions or host patterns
3. Reload the extension in `chrome://extensions/` after changes
4. Restart the web server if API changes are made

## Troubleshooting

- **Button not appearing**: Wait a few seconds for YouTube to load, or refresh the page
- **API errors**: Ensure the web server is running on localhost:3000
- **Transcript not loading**: The video may not have captions available, or transcript fetching needs implementation
- **Modal not showing**: Check browser console for JavaScript errors
