# 🚀 Gmail to Calendar Extension - Setup Guide

## Quick Start Checklist

### ✅ Step 1: Project Setup (COMPLETED)
- [x] Dependencies installed
- [x] Extension built successfully
- [x] Files ready for Chrome

### 🔧 Step 2: Google Cloud Console Configuration

#### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name it "Gmail to Calendar Extension"

#### 2.2 Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - **Google Calendar API**
   - **Google OAuth2 API** (if not already enabled)

#### 2.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client IDs"
3. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill required fields (App name, User support email, Developer email)
   - Add scope: `https://www.googleapis.com/auth/calendar`
4. Create OAuth client:
   - Application type: **Web application**
   - Name: "Gmail to Calendar Extension"
   - Authorized origins: Leave empty for now (will add after loading extension)

#### 2.4 Get Client ID
1. Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)
2. Update `public/manifest.json`:
   ```json
   "oauth2": {
     "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
     "scopes": ["https://www.googleapis.com/auth/calendar"]
   }
   ```

### 🔄 Step 3: Load Extension in Chrome

#### 3.1 Load Unpacked Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `dist` folder from your project
5. **Copy the Extension ID** (e.g., `abcdefghijklmnopqrstuvwxyz`)

#### 3.2 Update OAuth Configuration
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 client
3. Under "Authorized JavaScript origins", add:
   ```
   chrome-extension://YOUR_ACTUAL_EXTENSION_ID
   ```
4. Save changes

### 🧪 Step 4: Test the Extension

#### 4.1 Initial Setup
1. Click the extension icon in Chrome toolbar
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify you see "Connected to Google Calendar"

#### 4.2 Test Gmail Integration
1. Go to [Gmail](https://mail.google.com)
2. Open an email with event information like:
   ```
   Subject: Team Meeting Tomorrow
   
   Hi there,
   
   We have a team meeting scheduled for tomorrow at 2:00 PM in Conference Room A.
   Looking forward to seeing everyone there!
   ```
3. You should see the event detection popup appear
4. Click "Add to Calendar" to test the integration

## 🎯 Event Detection Examples

The extension detects events from emails containing:

### Meeting Invitations
```
Subject: Weekly Team Standup

Hello team,

Our weekly standup meeting is scheduled for:
- Date: Monday, January 15, 2024
- Time: 9:00 AM PST
- Location: Conference Room B
- Meeting link: https://meet.google.com/abc-defg-hij
```

### Appointment Confirmations
```
Subject: Appointment Confirmation

Your appointment has been confirmed:
- Service: Dental Checkup
- Date: Next Friday
- Time: 2:30 PM
- Location: 123 Main St, Suite 400
```

### Event Invitations
```
Subject: Company Holiday Party

You're invited to our annual holiday party!
- When: December 20, 2024 at 6:00 PM
- Where: Downtown Hotel Ballroom
- RSVP: Please confirm by December 15
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### "OAuth Error" or "Authentication Failed"
- ✅ Verify Client ID is correct in manifest.json
- ✅ Check that Google Calendar API is enabled
- ✅ Ensure Extension ID matches in OAuth settings
- ✅ Try removing and re-adding the extension

#### Events Not Detected
- ✅ Check if email contains clear date/time information
- ✅ Adjust detection sensitivity in extension settings
- ✅ Look for keywords like "meeting", "appointment", "event"
- ✅ Ensure email has at least one date and time pattern

#### Build Errors
```bash
# If you encounter build issues:
npm install
npm run build

# If Vite not recognized:
npx vite build
```

#### Content Script Not Working
- ✅ Refresh Gmail page after loading extension
- ✅ Check Chrome Developer Tools → Console for errors
- ✅ Verify manifest.json permissions are correct

## 📊 How Detection Works

### Pattern Matching Score System
- **Event Keywords**: meeting (+3), appointment (+3), call (+2), etc.
- **Time Patterns**: "2:00 PM" (+2), "morning" (+1)
- **Date Patterns**: "January 15" (+2), "tomorrow" (+2)
- **Context Clues**: "join us" (+1), "location" (+1)
- **Threshold**: Requires score ≥ 4 to show popup

### Smart Extraction
- **Title**: Extracted from subject line or first meaningful sentence
- **Date**: Supports multiple formats (MM/DD/YYYY, "next Monday", etc.)
- **Time**: 12/24-hour formats, relative times
- **Location**: Addresses, room numbers, online meeting links
- **Attendees**: Email addresses found in content

## 🔒 Privacy & Security

- **Local Processing**: All email analysis happens in your browser
- **No Data Storage**: Email content is not stored or transmitted
- **Google APIs Only**: Only communicates with Google Calendar API
- **Minimal Permissions**: Only requests necessary Gmail and Calendar access

## 🎨 Customization

### Detection Sensitivity
- **Low**: Only very clear events (meetings with explicit date/time)
- **Medium**: Balanced detection (recommended)
- **High**: More aggressive detection (may have false positives)

### UI Themes
The extension automatically adapts to your system's color scheme and supports:
- High contrast mode
- Reduced motion preferences
- Mobile/responsive design

## 📈 Next Steps

1. **Test thoroughly** with various email types
2. **Adjust settings** based on your preferences
3. **Report issues** if you find any problems
4. **Enjoy** seamless calendar integration!

---

**Need Help?** Check the troubleshooting section or review the extension logs in Chrome DevTools.
