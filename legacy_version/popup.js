// Popup JavaScript functionality
class PopupController {
  constructor() {
    this.initializeElements();
    this.loadSettings();
    this.checkConnectionStatus();
    this.attachEventListeners();
  }

  initializeElements() {
    this.elements = {
      statusDot: document.getElementById('status-dot'),
      statusText: document.getElementById('status-text'),
      autoDetect: document.getElementById('auto-detect'),
      showNotifications: document.getElementById('show-notifications'),
      defaultDuration: document.getElementById('default-duration'),
      scanButton: document.getElementById('scan-current-email'),
      authorizeButton: document.getElementById('authorize-calendar'),
      helpLink: document.getElementById('help-link')
    };
  }

  loadSettings() {
    chrome.storage.sync.get({
      autoDetect: true,
      showNotifications: true,
      defaultDuration: 60
    }, (settings) => {
      this.elements.autoDetect.checked = settings.autoDetect;
      this.elements.showNotifications.checked = settings.showNotifications;
      this.elements.defaultDuration.value = settings.defaultDuration;
    });
  }

  checkConnectionStatus() {
    // Check if user is on Gmail
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
        this.updateStatus('connected', 'Connected to Gmail');
        this.elements.scanButton.disabled = false;
      } else {
        this.updateStatus('disconnected', 'Please open Gmail to use this extension');
        this.elements.scanButton.disabled = true;
      }
    });

    // Check Google Calendar authorization
    this.checkCalendarAuth();
  }

  async checkCalendarAuth() {
    try {
      const token = await this.getAuthToken(false);
      if (token) {
        this.elements.authorizeButton.textContent = '✅ Calendar Authorized';
        this.elements.authorizeButton.disabled = true;
      }
    } catch (error) {
      this.elements.authorizeButton.textContent = '🔐 Authorize Google Calendar';
      this.elements.authorizeButton.disabled = false;
    }
  }

  updateStatus(status, message) {
    this.elements.statusDot.className = `status-indicator ${status}`;
    this.elements.statusText.textContent = message;
  }

  attachEventListeners() {
    // Settings change handlers
    this.elements.autoDetect.addEventListener('change', () => {
      this.saveSettings();
    });

    this.elements.showNotifications.addEventListener('change', () => {
      this.saveSettings();
    });

    this.elements.defaultDuration.addEventListener('change', () => {
      this.saveSettings();
    });

    // Action button handlers
    this.elements.scanButton.addEventListener('click', () => {
      this.scanCurrentEmail();
    });

    this.elements.authorizeButton.addEventListener('click', () => {
      this.authorizeCalendar();
    });

    this.elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.showHelp();
    });
  }

  saveSettings() {
    const settings = {
      autoDetect: this.elements.autoDetect.checked,
      showNotifications: this.elements.showNotifications.checked,
      defaultDuration: parseInt(this.elements.defaultDuration.value)
    };

    chrome.storage.sync.set(settings, () => {
      // Notify content script of settings change
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'settingsChanged',
            settings: settings
          });
        }
      });
    });
  }

  scanCurrentEmail() {
    this.elements.scanButton.disabled = true;
    this.elements.scanButton.textContent = '🔍 Scanning...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'scanEmail'
        }, (response) => {
          this.elements.scanButton.disabled = false;
          this.elements.scanButton.textContent = '🔍 Scan Current Email';

          if (response && response.eventsFound > 0) {
            this.showScanResult(`Found ${response.eventsFound} event(s)!`);
          } else {
            this.showScanResult('No calendar events detected in this email.');
          }
        });
      }
    });
  }

  async authorizeCalendar() {
    try {
      this.elements.authorizeButton.disabled = true;
      this.elements.authorizeButton.textContent = '⏳ Authorizing...';

      const token = await this.getAuthToken(true);
      
      if (token) {
        this.elements.authorizeButton.textContent = '✅ Calendar Authorized';
        this.showMessage('Google Calendar authorized successfully!', 'success');
      }
    } catch (error) {
      this.elements.authorizeButton.disabled = false;
      this.elements.authorizeButton.textContent = '🔐 Authorize Google Calendar';
      this.showMessage('Authorization failed. Please try again.', 'error');
    }
  }

  getAuthToken(interactive = false) {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      });
    });
  }

  showScanResult(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'scan-result';
    resultDiv.textContent = message;
    resultDiv.style.cssText = `
      margin-top: 10px;
      padding: 8px 12px;
      background: #e8f0fe;
      color: #1a73e8;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    `;

    this.elements.scanButton.parentNode.appendChild(resultDiv);

    setTimeout(() => {
      if (resultDiv.parentNode) {
        resultDiv.parentNode.removeChild(resultDiv);
      }
    }, 3000);
  }

  showMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    messageDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
      z-index: 1000;
      ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : ''}
      ${type === 'error' ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : ''}
      ${type === 'info' ? 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;' : ''}
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }

  showHelp() {
    const helpContent = `
      Automatic Calendar Update Extension Help:

      1. Setup:
         - Make sure you're logged into Gmail
         - Authorize Google Calendar access
         - Enable auto-detection in settings

      2. Usage:
         - Open any email in Gmail
         - The extension will automatically scan for calendar events
         - Click "Add to Calendar" when events are detected

      3. Supported formats:
         - "Meeting on Monday, January 15th, 2024 at 2:00 PM"
         - "Appointment scheduled for Tuesday at 10:30 AM"
         - "Conference on Wed, Feb 20th at 9:00 AM"

      4. Troubleshooting:
         - Refresh Gmail if detection isn't working
         - Re-authorize if calendar events aren't being added
         - Check that popup blockers aren't interfering

      Need more help? Contact support.
    `;

    alert(helpContent);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
