import { showNotification, initializeUIColor, updateUIColors, DEFAULT_UI_COLOR, COLORS } from './shared.js';

const uiColor = document.getElementById('uiColor');

// Load saved UI color
uiColor.value = localStorage.getItem('uiColor') || DEFAULT_UI_COLOR;
initializeUIColor();

// Save UI color when changed
uiColor.addEventListener('input', (e) => {
  const color = e.target.value;
  localStorage.setItem('uiColor', color);
  updateUIColors(color);
});

// Reset color to default
document.getElementById('resetColor').addEventListener('click', () => {
  uiColor.value = DEFAULT_UI_COLOR;
  localStorage.setItem('uiColor', DEFAULT_UI_COLOR);
  updateUIColors(DEFAULT_UI_COLOR);
  showNotification({ message: 'UI color reset to default', color: DEFAULT_UI_COLOR });
});

const confirmClearData = (type, action) => {
  showNotification({
    message: `Are you sure you want to clear all ${type}?`,
    color: "#FABE00",
    isPrompt: true,
    buttons: [
      {
        text: 'Yes',
        color: COLORS.error,
        action: () => {
          action();
          showNotification({ message: `All ${type} cleared`, color: COLORS.error });
        }
      },
      {
        text: 'No',
        color: COLORS.cancel
      }
    ]
  });
};

// Clear data event handlers
document.getElementById('clearQuickTiles').addEventListener('click', () => {
  confirmClearData('quick access tiles', () => localStorage.removeItem('quickTiles'));
});

document.getElementById('clearSavedSites').addEventListener('click', () => {
  confirmClearData('saved proxy sites', () => localStorage.removeItem('savedSites'));
});