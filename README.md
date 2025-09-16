# AI Display Chrome Extension

<img src="src/assets/icons/icon.png" width="128" height="128" alt="AI Display Icon">

A powerful Chrome extension that brings multiple AI assistants together in one convenient interface. Get answers from Google Gemini, Bing AI, Perplexity, Grok, and more - all at once!

**No API keys required** - Works directly with AI provider websites.

## Quick Start

### Download & Install

**[⬇️ Download Here](https://github.com/elsesourav/ai-display/raw/main/ai-display-extension.zip)**

**Installation Steps:**

1. **Download** the extension zip file using the button above
2. **Extract** the zip file to any folder on your computer
3. **Open your browser** and navigate to the extensions page:
   -  **Chrome**: `chrome://extensions/`
   -  **Edge**: `edge://extensions/`
   -  **Opera**: `opera://extensions/`
4. **Enable Developer Mode** - Toggle the switch in the top-right corner
5. **Click "Load unpacked"** button (or "Load extension" in some browsers)
6. **Select the extracted folder** containing the extension files
7. **Done!** The extension icon will appear in your browser toolbar

**Need help?** See the detailed installation guide below.

## Features

### Multi-AI Support

-  **Google Gemini** - Google's advanced AI model
-  **Bing AI** - Microsoft's AI-powered search
-  **Perplexity** - AI-powered research assistant
-  **Grok** - Real-time AI responses
-  **More providers** - Additional AI services coming soon

### Concurrent Requests

-  Ask all AI providers simultaneously
-  Compare responses side-by-side
-  Switch between answers instantly
-  Smart loading states for each provider

### Flexible Interface

-  **Popup Mode** - Quick access from browser toolbar
-  **Floating Menu** - Draggable overlay on any webpage
-  **Screen Selection** - OCR text from images and screenshots
-  **Theme Support** - Automatic dark/light mode detection

### Advanced UI

-  **Custom Icon System** - Beautiful SVG icon library with 50+ icons
-  **Smooth Animations** - Polished transitions and effects
-  **Responsive Design** - Works on all screen sizes
-  **Tailwind CSS** - Modern styling framework

### Smart Features

-  **OCR Integration** - Extract text from images using Tesseract.js
-  **Drag & Drop** - Reorder AI providers by preference
-  **Persistent Settings** - Remember your configurations
-  **Keyboard Shortcuts** - Quick access with hotkeys

## Highlights

<table>
  <tr>
    <td>
      <h4>Extension Popup</h4>
      <img height="400" src="./src/assets/gif/popup-overview.gif">
    </td>
    <td>
      <h4>Multi-AI Chat</h4>
      <img height="400" src="./src/assets/gif/chat-interface.gif">
    </td>
  </tr>
  <tr>
    <td>
      <h4>Floating Menu</h4>
      <img height="400" src="./src/assets/gif/floating-menu.gif">
    </td>
    <td>
      <h4>Screen Selection OCR</h4>
      <img height="400" src="./src/assets/gif/screen-selection.gif">
    </td>
  </tr>
</table>

### Installation From Source Code

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `extension` folder

### Basic Usage

1. **Click the extension icon** in your browser toolbar
2. **Type your question** in the input field
3. **Press Enter** or click send to query all AI providers
4. **Switch between providers** using the tabs to compare answers
5. **Use the floating menu** by right-clicking on any webpage

### Advanced Features

-  **Screen Selection**: Right-click → AI Display → Select area to OCR text
-  **Menu Positioning**: Drag the floating menu anywhere on the page
-  **Provider Settings**: Configure which AI services to use
-  **Keyboard Shortcuts**: Press Escape to close, Enter to send

## Important Note

**This is NOT a data collection app.** The extension:

-  Does not store your conversations
-  Does not track your browsing
-  Does not send data to third parties
-  Only communicates with AI providers you choose
-  Keeps all settings locally in your browser

Your privacy and data security are our top priorities.

## Technical Stack

-  **React 18** - Modern UI framework
-  **Vite** - Fast build tool and development server
-  **Tailwind CSS** - Utility-first CSS framework
-  **Chrome Extension APIs** - Native browser integration
-  **Tesseract.js** - OCR text recognition
-  **React Icons** - Additional icon library

## Project Structure

```
src/
├── components/          # React components
├── inject/             # Content script injections
├── popup/              # Extension popup interface
├── assets/             # Icons, images, fonts
├── utils/              # Utility functions
└── hooks/              # Custom React hooks

extension/              # Built extension files
scripts/                # All scripts flies
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build and watch for changes
npm run build:watch

# Create extension zip file
npm run zip

# Build and zip in one command (recommended)
npm run build:zip
```

### Creating Extension Package

To package your extension for distribution:

1. **Build the extension**:

   ```bash
   npm run build
   ```

2. **Create zip file**:

   ```bash
   npm run zip
   ```

   Or build and zip in one command:

   ```bash
   npm run build:zip
   ```

3. **Package created**:
   -  The script creates `ai-display-extension.zip` in the project root
   -  This zip file contains all necessary extension files and assets
   -  Ready for sharing or distribution

**Note**: Make sure to run `npm install` first to install the required `archiver` dependency for zip creation.

## License

This project is licensed under the [MIT License](MIT-LICENSE.txt).

## Sharing and Highlights

Feel free to share this project! Here are some key highlights to mention:

-  **No API Keys Required** - Works directly with AI provider websites
-  **Multiple AI Providers** - Google Gemini, Bing AI, Perplexity, Grok and more
-  **Privacy Focused** - No data collection, everything stays local
-  **OCR Integration** - Extract text from images and screenshots
-  **React + Vite** - Modern development stack with Tailwind CSS

## Contact

For questions, feedback, or contributions, please contact me:

-  [Email](mailto:elsesourav@gmail.com)
-  [Twitter](https://twitter.com/elsesourav)
-  [LinkedIn](https://linkedin.com/in/elsesourav)
-  [Facebook](https://fb.com/elsesourav)
-  [Instagram](https://instagram.com/elsesourav)

## Copyright

Copyright (c) 2025 Sourav Barui. All rights reserved.

---

**Made with love for AI enthusiasts who want the best of all worlds!**
