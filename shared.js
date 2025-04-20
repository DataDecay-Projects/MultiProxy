// Common utils
export const DEFAULT_UI_COLOR = '#00c100';
export const COLORS = {
  success: '#00c100',
  warning: '#ff9800',
  error: '#ff4444',
  cancel: '#666666'
};

// Color utilities
function isLightColor(color) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export function updateUIColors(color) {
  document.documentElement.style.setProperty('--ui-color', color);
  const textColor = isLightColor(color) ? '#000000' : '#ffffff';
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
        button.style.color = isLightColor(btn.color) ? '#000' : '#fff';
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