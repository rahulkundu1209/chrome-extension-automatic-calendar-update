// Background service worker for handling Google Calendar API
class CalendarService {
  constructor() {
    this.accessToken = null;
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'addToCalendar') {
        this.handleAddToCalendar(request.event)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
      }
    });
  }

  async handleAddToCalendar(event) {
    try {
      // Get access token
      if (!this.accessToken) {
        await this.authenticate();
      }

      // Create calendar event
      const calendarEvent = this.formatEventForCalendar(event);
      const result = await this.createCalendarEvent(calendarEvent);
      
      return result;
    } catch (error) {
      console.error('Error adding to calendar:', error);
      throw error;
    }
  }

  async authenticate() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          this.accessToken = token;
          resolve(token);
        }
      });
    });
  }

  formatEventForCalendar(event) {
    const startDateTime = this.parseDateTime(event.date, event.time);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      summary: event.title,
      description: event.description,
      location: event.location || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 } // 30 minutes before
        ]
      }
    };
  }

  parseDateTime(dateStr, timeStr) {
    // Clean and normalize the date string
    const cleanDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/g, '$1');
    
    // Parse date
    const date = new Date(cleanDateStr);
    
    if (isNaN(date.getTime())) {
      // Fallback to manual parsing
      const datePattern = /(\w+),?\s+(\w+)\s+(\d{1,2}),?\s+(\d{4})/;
      const match = cleanDateStr.match(datePattern);
      
      if (match) {
        const [, , month, day, year] = match;
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        date.setFullYear(parseInt(year), monthIndex, parseInt(day));
      }
    }

    // Parse time
    if (timeStr) {
      const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;
      const timeMatch = timeStr.match(timePattern);
      
      if (timeMatch) {
        let [, hours, minutes, period] = timeMatch;
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        
        if (period && period.toLowerCase() === 'pm' && hours !== 12) {
          hours += 12;
        } else if (period && period.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
        }
        
        date.setHours(hours, minutes, 0, 0);
      }
    }

    return date;
  }

  async createCalendarEvent(calendarEvent) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEvent)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Failed to create calendar event');
    }

    return await response.json();
  }
}

// Initialize the service
new CalendarService();
