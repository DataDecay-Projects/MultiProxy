// Common utils
export const DEFAULT_UI_COLOR = '#00c100';
export const COLORS = {
  success: '#00c100',
  warning: '#ff9800',
  error: '#ff4444',
  cancel: '#666666'
};

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

export function updateUIColors(color) {
  document.documentElement.style.setProperty('--ui-color', color);
  const textColor = getBestTextColor(color);
  document.documentElement.style.setProperty('--ui-text-color', textColor);
}

// Initialize UI color
export function initializeUIColor() {
  const color = localStorage.getItem('uiColor') || DEFAULT_UI_COLOR;
  updateUIColors(color);
  return color;
}

// Common notification system
export function showNotification(options) {
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