# Gmail to Calendar Chrome Extension

A Chrome extension that automatically detects events in Gmail emails and allows you to add them to Google Calendar with just a few clicks.

## Features

- 🔍 **Smart Event Detection**: Uses advanced pattern matching to detect events in emails
- 📅 **One-Click Calendar Integration**: Add events to Google Calendar instantly
- 🎯 **Gmail Integration**: Works seamlessly within Gmail interface
- ⚙️ **Customizable Settings**: Adjust detection sensitivity and preferences
- 🎨 **Beautiful UI**: Clean, modern interface following Google's design principles

## Setup Instructions

### 1. Install Dependencies

First, install the required packages:

```bash
npm install
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins:
     - `chrome-extension://[YOUR_EXTENSION_ID]`
   - Copy the Client ID

5. Update the manifest.json file:
   - Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID

### 3. Build the Extension

```bash
npm run build
```

### 4. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your project

### 5. Get Your Extension ID

1. After loading the extension, copy the Extension ID from the Chrome extensions page
2. Go back to Google Cloud Console > Credentials
3. Edit your OAuth 2.0 client
4. Add the correct authorized origin: `chrome-extension://[ACTUAL_EXTENSION_ID]`

## How It Works

### Event Detection

The extension uses sophisticated pattern matching to detect:

- **Event Types**: meetings, appointments, conferences, webinars, calls, etc.
- **Date Patterns**: Various date formats including relative dates (today, tomorrow, next Monday)
- **Time Patterns**: 12-hour and 24-hour time formats
- **Location Information**: Addresses, room numbers, online meeting links
- **Attendees**: Email addresses mentioned in the content

### Smart Extraction

The background script processes email content and extracts:

- **Title**: Event name using context clues and pattern matching
- **Date & Time**: Parsed and formatted for Google Calendar
- **Location**: Physical addresses or online meeting details
- **Description**: Relevant email content
- **Attendees**: Email addresses found in the content

### User Interface

- **Content Script Popup**: Appears when events are detected in Gmail
- **Extension Popup**: Settings and status management
- **Seamless Integration**: Works within Gmail's interface

## Usage

1. **Authentication**: Click "Sign in with Google" in the extension popup
2. **Automatic Detection**: Open emails in Gmail - the extension will automatically detect events
3. **Add to Calendar**: When a popup appears, click "Add to Calendar" to create the event
4. **Settings**: Adjust detection sensitivity and preferences in the extension popup

## Troubleshooting

### Common Issues

1. **"vite is not recognized" Error**:
   ```bash
   npm install
   npm run build
   ```

2. **Authentication Issues**:
   - Verify your Google Cloud Console setup
   - Check that the Extension ID matches in your OAuth credentials
   - Ensure Google Calendar API is enabled

3. **Event Not Detected**:
   - Check detection sensitivity in settings
   - Ensure the email contains clear date/time information
   - Look for event-related keywords

## Privacy & Security

- The extension only accesses Gmail content when actively viewing emails
- No email content is stored or transmitted to external servers
- Only Google Calendar API is used for adding events
- All data is processed locally in your browser+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
