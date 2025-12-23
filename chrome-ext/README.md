# SummaTube - WXT Version

A modern, TypeScript-powered Chrome extension built with WXT that automatically extracts and displays YouTube video transcripts in a sidebar panel with AI-powered summaries.

## ✨ What's New in WXT Version

- **TypeScript**: Full type safety and better IntelliSense
- **Hot Reloading**: Instant development updates
- **Modern Tooling**: Vite build system with optimizations
- **Better DX**: Professional development workflow

## 🚀 Features

- **Automatic Transcript Extraction**: Extracts YouTube video transcripts
- **Interactive Timestamps**: Click timestamps to jump to video segments
- **AI-Powered Summaries**: Generate summaries using OpenAI GPT-3.5
- **Dark Mode Support**: Automatically adapts to YouTube's theme
- **Collapsible UI**: Minimize/maximize the transcript panel
- **Secure API Key Storage**: Keys stored locally in browser

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server with hot reloading
npm run dev

# Build for production
npm run build

# Create ZIP for Chrome Web Store
npm run zip
```

### Loading in Chrome

1. **Build the extension**:
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"

3. **Load Extension**:
   - Click "Load unpacked"
   - Select `chrome-ext/dist/chrome-mv3`
   - The extension will be loaded!

## 📁 Project Structure

```
chrome-ext/
├── entrypoints/
│   └── content.ts          # Main content script (TypeScript)
├── public/                 # Static assets
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── logo.png
├── dist/                   # Built extension (visible!)
│   └── chrome-mv3/
│       ├── manifest.json
│       └── content-scripts/
├── styles.css              # Extension styles
├── wxt.config.ts           # WXT configuration
├── package.json            # Dependencies
└── README.md              # This file
```

## 🔑 OpenAI API Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In the extension, click "🔑 Set API Key"
3. Paste your key (stored securely in browser storage)

## 🆚 Comparison: Old vs New

| Feature | Original | WXT Version |
|---------|----------|-------------|
| Language | JavaScript | TypeScript |
| Build Tool | Manual | Vite + WXT |
| Hot Reload | ❌ | ✅ |
| Type Safety | ❌ | ✅ |
| Development | Manual reload | Auto-reload |
| Bundle Size | ~15KB | ~25KB (optimized) |
| Maintenance | Harder | Easier |

## 🎯 Migration Benefits

- **Professional Workflow**: Industry-standard tooling
- **Type Safety**: Catch errors before runtime
- **Better Debugging**: Source maps and modern debugging
- **Future-Proof**: Easy to add new features
- **Cross-Browser**: Ready for Firefox/Safari support

## 🧪 Testing

Visit any YouTube video with captions enabled to see the extension in action!

## 📦 Building for Production

```bash
npm run build  # Creates optimized build in dist/chrome-mv3/ (visible!)
npm run zip    # Creates submission-ready ZIP
```

The built extension maintains all original functionality while providing a much better development experience.
