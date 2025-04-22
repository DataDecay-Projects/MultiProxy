import { Octokit } from "https://esm.sh/@octokit/core";

// Common utils
const DEFAULT_UI_COLOR = '#00c100';
const COLORS = {
  success: '#00c100',
  warning: '#ff9800',
  error: '#ff4444',
  cancel: '#666666'
};

// Create an unauthenticated Octokit instance for public gists
const octokit = new Octokit();

// Settings management
const DEFAULT_SETTINGS = {
  uiColor: DEFAULT_UI_COLOR,
  quickTiles: [],
  savedSites: [],
  lastSeenAnnouncement: [] // Array of seen announcement hashes
};

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('settings')) || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function updateSettings(updates) {
  const settings = getSettings();
  const newSettings = { ...settings, ...updates };
  localStorage.setItem('settings', JSON.stringify(newSettings));
  return newSettings;
}

function clearSettingsSection(section) {
  const settings = getSettings();
  settings[section] = DEFAULT_SETTINGS[section];
  localStorage.setItem('settings', JSON.stringify(settings));
}

// Announcement management
let announcementCheckInterval;
let lastAnnouncementCheck = 0;
const ANNOUNCEMENT_CHECK_INTERVAL = 60000; // Check every minute
const GIST_ID = 'de04afdae86c5c41399fecd097f984e9'; // Replace with your actual Gist ID

// Hash function for messages
function hashMessage(message) {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36); // Convert to base36 for shorter string
}

async function checkAnnouncements(bypass = false) {
  const settings = getSettings();
  const now = Date.now();
  if (now - lastAnnouncementCheck < ANNOUNCEMENT_CHECK_INTERVAL && !bypass) {
    return null;
  }
  lastAnnouncementCheck = now;

  try {
    const response = await octokit.request('GET /gists/{gist_id}', {
      gist_id: GIST_ID,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.data || !response.data.files) return null;

    const announcementFile = Object.values(response.data.files).find(file => 
      file.filename === 'announcements.json');
    if (!announcementFile || !announcementFile.content) return null;

    const announcements = JSON.parse(announcementFile.content);
    if (!Array.isArray(announcements)) return null;

    // Find first valid announcement that hasn't been seen
    for (const announcement of announcements) {
      if (!announcement.message) continue;

      const startTime = announcement.startTime ? new Date(announcement.startTime).getTime() : 0;
      const endTime = announcement.endTime ? new Date(announcement.endTime).getTime() : Infinity;
      const now = Date.now();

      if (now >= startTime && now <= endTime) {
        // Generate hash of the message content
        const messageHash = hashMessage(announcement.message);
        
        // Check if this exact message hash has been seen
        if (!Array.isArray(settings.lastSeenAnnouncement)) {
          settings.lastSeenAnnouncement = []; // Reset if not array
        }
        
        if (settings.lastSeenAnnouncement.includes(messageHash)) {
          continue;
        }

        // Add the new hash to the array of seen announcements
        settings.lastSeenAnnouncement.push(messageHash);
        updateSettings({ lastSeenAnnouncement: settings.lastSeenAnnouncement });

        return announcement;
      }
    }
  } catch (error) {
    console.error('Error checking announcements:', error);
    return null;
  }
  return null;
}

function startAnnouncementChecks() {
  // Clear any existing interval
  if (announcementCheckInterval) {
    clearInterval(announcementCheckInterval);
  }

  // Check immediately
  checkAnnouncements().then(announcement => {
    if (announcement) {
      showNotification({
        message: announcement.message,
        color: announcement.color || COLORS.success,
        timeout: announcement.timeout || 5000
      });
    }
  });

  // Set up periodic checks
  announcementCheckInterval = setInterval(async () => {
    const announcement = await checkAnnouncements();
    if (announcement) {
      showNotification({
        message: announcement.message,
        color: announcement.color || COLORS.success,
        timeout: announcement.timeout || 5000
      });
    }
  }, ANNOUNCEMENT_CHECK_INTERVAL);
}

// Color utilities
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  const rgb1 = [
    parseInt(hex1.substr(0, 2), 16),
    parseInt(hex1.substr(2, 2), 16),
    parseInt(hex1.substr(4, 2), 16)
  ];
  const rgb2 = [
    parseInt(hex2.substr(0, 2), 16),
    parseInt(hex2.substr(2, 2), 16),
    parseInt(hex2.substr(4, 2), 16)
  ];
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getBestTextColor(bgColor) {
  const whiteContrast = getContrastRatio(bgColor, '#ffffff');
  const blackContrast = getContrastRatio(bgColor, '#000000');
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

function updateUIColors(color) {
  document.documentElement.style.setProperty('--ui-color', color);
  const textColor = getBestTextColor(color);
  document.documentElement.style.setProperty('--ui-text-color', textColor);
}

// Initialize UI color
function initializeUIColor() {
  const color = localStorage.getItem('uiColor') || DEFAULT_UI_COLOR;
  updateUIColors(color);
  return color;
}

// Common notification system
function showNotification(options) {
  const notification = document.getElementById('notification');
  if (!notification) {
    console.error('Notification element not found');
    return;
  }

  if (typeof options === 'string') {
    options = { message: options };
  }

  const {
    message,
    timeout = 3000,
    color = COLORS.success,
    buttons = [],
    isPrompt = false
  } = options;

  notification.innerHTML = message;
  notification.style.background = color;
  notification.style.color = getBestTextColor(color);
  notification.style.borderColor = color;

  if (buttons.length > 0) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'notification-buttons';
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'notification-button';
      button.textContent = btn.text;
      button.onclick = () => {
        if (btn.action) btn.action();
        notification.style.display = 'none';
      };
      if (btn.color) {
        button.style.background = btn.color;
        button.style.color = getBestTextColor(btn.color);
        button.style.borderColor = btn.color;
      }
      buttonsContainer.appendChild(button);
    });

    notification.appendChild(buttonsContainer);
  }

  notification.style.display = 'block';

  if (!isPrompt && timeout > 0) {
    setTimeout(() => {
      notification.style.display = 'none';
    }, timeout);
  }

  return new Promise(resolve => {
    if (!isPrompt) resolve();
  });
}

export {
  DEFAULT_UI_COLOR,
  COLORS,
  DEFAULT_SETTINGS,
  getSettings,
  updateSettings,
  clearSettingsSection,
  hashMessage,
  checkAnnouncements,
  startAnnouncementChecks, 
  updateUIColors,
  initializeUIColor,
  showNotification
};

