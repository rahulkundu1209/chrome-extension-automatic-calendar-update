import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...')
  const [settings, setSettings] = useState({
    autoDetect: true,
    showNotifications: true,
    defaultDuration: 60
  })

  useEffect(() => {
    checkAuthStatus()
    loadSettings()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getAuthToken' }, resolve)
      })
      if (response && response.success) {
        setIsAuthenticated(true)
        setConnectionStatus('Connected to Google Calendar')
      } else {
        setIsAuthenticated(false)
        setConnectionStatus('Not connected')
      }
    } catch {
      setIsAuthenticated(false)
      setConnectionStatus('Connection error')
    }
    setIsLoading(false)
  }

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get(['cedSettings'])
      if (result.cedSettings) {
        setSettings(result.cedSettings)
      }
    } catch {}
  }

  const updateSettings = async (newSettings) => {
    setSettings(newSettings)
    try {
      await chrome.storage.sync.set({ cedSettings: newSettings })
    } catch {}
  }

  const handleAuthorize = async () => {
    setIsLoading(true)
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getAuthToken' }, resolve)
      })
      if (response && response.success) {
        setIsAuthenticated(true)
        setConnectionStatus('Connected to Google Calendar')
      } else {
        setIsAuthenticated(false)
        setConnectionStatus('Authorization failed')
      }
    } catch {
      setIsAuthenticated(false)
      setConnectionStatus('Authorization error')
    }
    setIsLoading(false)
  }

  const handleScanEmail = () => {
    chrome.runtime.sendMessage({ action: 'scanCurrentEmail' })
  }

  const openHelp = () => {
    chrome.tabs.create({ url: 'https://github.com/your-extension/help' })
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>📅 Calendar Event Detector</h1>
        <p>Automatically detect and add email events to Google Calendar</p>
      </header>

      <main className="popup-main">
        <div className="status-section">
          <h2>Status</h2>
          <div id="connection-status" className="status-item">
            <span
              className={`status-indicator${isAuthenticated ? ' connected' : ''}`}
              id="status-dot"
            ></span>
            <span id="status-text">{connectionStatus}</span>
          </div>
        </div>

        <div className="controls-section">
          <h2>Settings</h2>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                id="auto-detect"
                checked={settings.autoDetect}
                onChange={e =>
                  updateSettings({ ...settings, autoDetect: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Auto-detect events in emails
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                id="show-notifications"
                checked={settings.showNotifications}
                onChange={e =>
                  updateSettings({ ...settings, showNotifications: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Show detection notifications
            </label>
          </div>
          <div className="setting-item">
            <label htmlFor="default-duration">Default event duration:</label>
            <select
              id="default-duration"
              value={settings.defaultDuration}
              onChange={e =>
                updateSettings({ ...settings, defaultDuration: Number(e.target.value) })
              }
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <div className="actions-section">
          <button
            id="scan-current-email"
            className="primary-btn"
            onClick={handleScanEmail}
            disabled={isLoading}
          >
            🔍 Scan Current Email
          </button>
          <button
            id="authorize-calendar"
            className="secondary-btn"
            onClick={handleAuthorize}
            disabled={isAuthenticated || isLoading}
          >
            🔐 Authorize Google Calendar
          </button>
        </div>

        <div className="info-section">
          <h2>How it works</h2>
          <ul>
            <li>Open Gmail and navigate to an email</li>
            <li>The extension automatically scans for calendar events</li>
            <li>Click "Add to Calendar" when events are detected</li>
            <li>Events are added to your Google Calendar</li>
          </ul>
        </div>
      </main>

      <footer className="popup-footer">
        <p>
          Version 1.0 |{' '}
          <a href="#" id="help-link" onClick={openHelp}>
            Need help?
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
