# Automatic Calendar Update Chrome Extension

A Chrome extension that automatically detects calendar events in Gmail emails and allows users to add them to Google Calendar with just a few clicks.

## 🚀 Features

- **Automatic Event Detection**: Scans Gmail emails for calendar events using intelligent pattern recognition
- **One-Click Calendar Integration**: Add detected events to Google Calendar instantly
- **Smart Event Parsing**: Extracts event titles, dates, times, and locations from email content
- **Gmail Integration**: Seamlessly works within Gmail interface
- **User-Friendly Interface**: Clean popup with event previews and confirmation
- **Customizable Settings**: Configure detection preferences and default event duration

## 📋 Requirements

- Google Chrome browser (Manifest V3 support)
- Gmail account
- Google Calendar access

## 🛠️ Installation & Setup

### 1. Google Cloud Console Setup

Before installing the extension, you need to set up Google API credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized origins: `chrome-extension://[your-extension-id]`
   - Copy the Client ID

### 2. Extension Installation

1. Clone or download this repository
2. Open `manifest.json` and replace `"YOUR_GOOGLE_CLIENT_ID"` with your actual Google Client ID from step 1
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extension folder
6. Note the extension ID that appears

### 3. Update OAuth Settings

1. Go back to Google Cloud Console > Credentials
2. Edit your OAuth client ID
3. Update the authorized origins with your actual extension ID:
   `chrome-extension://[actual-extension-id]`

## 🎯 How to Use

1. **Setup**: Click the extension icon and authorize Google Calendar access
2. **Detection**: Open Gmail and navigate to any email
3. **Automatic Scanning**: The extension automatically scans emails for calendar events
4. **Add Events**: When events are detected, a popup appears with "Add to Calendar" buttons
5. **Confirmation**: Events are added to your Google Calendar with default 1-hour duration

## 🔧 Supported Event Formats

The extension recognizes various date and time formats:

- "Meeting on Monday, January 15th, 2024 at 2:00 PM"
- "Appointment scheduled for Tuesday at 10:30 AM" 
- "Conference on Wed, Feb 20th at 9:00 AM"
- "Event tomorrow at 3:30 PM"
- "Schedule for Friday, March 1st, 2024 at 11:00 AM"

## ⚙️ Configuration

Access settings through the extension popup:

- **Auto-detect events**: Toggle automatic scanning
- **Show notifications**: Enable/disable detection notifications  
- **Default duration**: Set default event length (30 min - 2 hours)

## 🏗️ Project Structure

```
automatic-calendar-update/
├── manifest.json          # Extension manifest (Manifest V3)
├── content.js             # Content script for Gmail integration
├── background.js          # Service worker for API calls
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── styles.css            # Content script styles
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🔒 Privacy & Permissions

The extension requires these permissions:

- `activeTab`: Access current Gmail tab for email scanning
- `storage`: Save user preferences
- `identity`: Google OAuth authentication
- `https://mail.google.com/*`: Gmail access
- `https://www.googleapis.com/*`: Google Calendar API access

## 🐛 Troubleshooting

**Event detection not working:**
- Refresh the Gmail page
- Make sure you're viewing an email (not inbox list)
- Check that the email contains clear date/time information

**Calendar integration fails:**
- Re-authorize Google Calendar access through the popup
- Verify your Google Client ID is correctly set in manifest.json
- Check browser console for error messages

**Extension not loading:**
- Ensure all files are in the correct directory structure
- Verify manifest.json syntax is valid
- Check that Developer mode is enabled in Chrome

## 🔄 Development

To modify or extend the extension:

1. **Event Detection**: Edit patterns in `content.js` > `eventPatterns` array
2. **UI Changes**: Modify `popup.html`, `popup.css`, and `styles.css`
3. **API Integration**: Update `background.js` for additional calendar features
4. **Settings**: Add new options in `popup.js` and corresponding storage

## 📝 Version History

- **v1.0**: Initial release with basic event detection and calendar integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Gmail
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the troubleshooting section
- Review Google Calendar API documentation

---

**Note**: This extension is not affiliated with Google. Gmail and Google Calendar are trademarks of Google LLC.
