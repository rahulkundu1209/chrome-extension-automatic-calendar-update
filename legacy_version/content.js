// Content script that runs on Gmail pages
class CalendarEventDetector {
  constructor() {
    this.eventPatterns = [
      // Meeting patterns
      /meeting\s+(?:on\s+)?(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi,
      // Appointment patterns
      /appointment\s+(?:on\s+)?(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi,
      // Event patterns
      /event\s+(?:on\s+)?(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi,
      // Conference patterns
      /conference\s+(?:on\s+)?(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi,
      // Schedule patterns
      /scheduled\s+(?:for\s+)?(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi,
      // Date and time patterns
      /(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\s+(?:at\s+)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi
    ];
    
    this.lastScannedContent = null; // Track last scanned email content
    this.scanTimeout = null; // For debouncing scans
    
    this.init();
  }

  init() {
    // Check if Chrome extension APIs are available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.error('Chrome extension APIs not available. Extension may not be loaded properly.');
      return;
    }

    console.log('Calendar Event Detector initialized');
    this.observeEmailChanges();
    this.scanCurrentEmail();
  }

  observeEmailChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Skip if the mutation is our own popup being added/removed
          const isOurPopup = Array.from(mutation.addedNodes).some(node => 
            node.id === 'calendar-event-popup' || 
            (node.classList && node.classList.contains('calendar-popup'))
          ) || Array.from(mutation.removedNodes).some(node => 
            node.id === 'calendar-event-popup' || 
            (node.classList && node.classList.contains('calendar-popup'))
          );
          
          if (isOurPopup) return;
          
          // Check if a new email is loaded
          const emailContent = document.querySelector('[data-message-id]');
          if (emailContent) {
            // Add a small delay and debounce to prevent multiple rapid calls
            clearTimeout(this.scanTimeout);
            this.scanTimeout = setTimeout(() => this.scanCurrentEmail(), 1000);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanCurrentEmail() {
    // Prevent scanning if we already have a popup showing
    if (document.getElementById('calendar-event-popup')) {
      console.log("Popup already exists, skipping scan");
      return;
    }

    const emailBody = this.getEmailBody();
    if (!emailBody) return;
    console.log("Email Body: ", emailBody);

    // Check if this is the same content we already scanned
    if (this.lastScannedContent === emailBody) {
      console.log("Same email content, skipping scan");
      return;
    }

    console.log("Scanning new email content for calendar events");
    this.lastScannedContent = emailBody;

    const events = this.extractEvents(emailBody);
    if (events.length > 0) {
      this.showEventDetectionPopup(events);
    }
  }

  getEmailBody() {
    // Try different selectors for Gmail email body
    const selectors = [
      '.ii.gt .a3s.aiL',
      '.ii.gt div[dir="ltr"]',
      '.gmail_default',
      '[data-message-id] .a3s.aiL'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.innerText || element.textContent;
      }
    }
    return null;
  }

  extractEvents(text) {
    const events = [];
    
    for (const pattern of this.eventPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const event = this.parseEventDetails(match, text);
        if (event) {
          console.log(event);
          events.push(event);
        }
      }
    }

    return this.deduplicateEvents(events);
  }

  parseEventDetails(match, fullText) {
    const [fullMatch, dateStr, timeStr] = match;
    
    if (!dateStr) return null;

    // Extract context around the match for event title
    const matchIndex = fullText.indexOf(fullMatch);
    const contextStart = Math.max(0, matchIndex - 100);
    const contextEnd = Math.min(fullText.length, matchIndex + fullMatch.length + 100);
    const context = fullText.substring(contextStart, contextEnd);

    // Try to extract event title from context
    const title = this.extractEventTitle(context, fullMatch);

    return {
      title: title || 'Event from Email',
      date: dateStr,
      time: timeStr || '9:00 AM',
      description: context.trim(),
      location: this.extractLocation(context)
    };
  }

  extractEventTitle(context, fullMatch) {
    // Look for common title patterns
    const titlePatterns = [
      /(?:meeting|appointment|event|conference)\s+(?:about|regarding|for)?\s*[:\-]?\s*([^.!?\n]{10,80})/i,
      /subject:\s*([^.!?\n]{10,80})/i,
      /title:\s*([^.!?\n]{10,80})/i,
      /([^.!?\n]{10,80})\s+(?:meeting|appointment|event|conference)/i
    ];

    for (const pattern of titlePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  extractLocation(context) {
    const locationPatterns = [
      /(?:at|in|location:)\s*([^.!?\n,]{5,50})/i,
      /(?:room|office|building)\s*[:\-]?\s*([^.!?\n,]{5,50})/i
    ];

    for (const pattern of locationPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  deduplicateEvents(events) {
    const unique = [];
    const seen = new Set();

    for (const event of events) {
      const key = `${event.date}-${event.time}-${event.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(event);
      }
    }

    return unique;
  }

  showEventDetectionPopup(events) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('calendar-event-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    const popup = this.createPopup(events);
    document.body.appendChild(popup);
  }

  createPopup(events) {
    console.log("Inside createPopup");
    const popup = document.createElement('div');
    popup.id = 'calendar-event-popup';
    popup.className = 'calendar-popup';

    popup.innerHTML = `
      <div class="popup-header">
        <h3>📅 Calendar Events Detected</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="popup-content">
        <p>Found ${events.length} potential calendar event(s) in this email:</p>
        <div class="events-list">
          ${events.map((event, index) => `
            <div class="event-item" data-index="${index}">
              <h4>${event.title}</h4>
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Time:</strong> ${event.time}</p>
              ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
              <button class="add-to-calendar-btn" data-index="${index}">
                Add to Google Calendar
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add event listeners for close button
    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      console.log("Remove button clicked")
      popup.remove();
    });

    // Add event listeners for calendar buttons
    popup.querySelectorAll('.add-to-calendar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.addToGoogleCalendar(events[index]);
      });
    });

    return popup;
  }

  addToGoogleCalendar(event) {
    // Check if Chrome extension APIs are available
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.error('Chrome extension APIs not available');
      this.showErrorMessage('Extension APIs not available. Please reload the page.');
      return;
    }

    console.log('Sending event to background script:', event);

    // Send message to background script to handle calendar API
    try {
      chrome.runtime.sendMessage({
        action: 'addToCalendar',
        event: event
      }, (response) => {
        // Check for runtime errors
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          this.showErrorMessage(`Communication error: ${chrome.runtime.lastError.message}`);
          return;
        }

        // Check if we got a response
        if (!response) {
          console.error('No response from background script');
          this.showErrorMessage('No response from calendar service. Please try again.');
          return;
        }

        // Handle the response
        if (response.success) {
          this.showSuccessMessage();
        } else {
          this.showErrorMessage(response.error || 'Unknown error occurred');
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this.showErrorMessage(`Failed to communicate with calendar service: ${error.message}`);
    }
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = '✅ Event added to Google Calendar successfully!';
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  showErrorMessage(error) {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.textContent = `❌ Error adding event: ${error}`;
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 5000);
  }
}

// Initialize the detector when the page loads
function initializeExtension() {
  // Check if we're in a Chrome extension context
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('Calendar Extension: Chrome APIs not available');
    return;
  }

  // Check if we're on Gmail
  if (!window.location.hostname.includes('mail.google.com')) {
    console.log('Calendar Extension: Not on Gmail, skipping initialization');
    return;
  }

  console.log('Calendar Extension: Initializing on Gmail');
  new CalendarEventDetector();
}

// Try different initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  // Document already loaded
  initializeExtension();
}

// Also try after a short delay in case APIs load asynchronously
setTimeout(() => {
  if (typeof chrome !== 'undefined' && chrome.runtime && !window.calendarExtensionInitialized) {
    window.calendarExtensionInitialized = true;
    initializeExtension();
  }
}, 1000);