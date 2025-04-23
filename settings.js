import { showNotification, initializeUIColor, updateUIColors, DEFAULT_UI_COLOR, COLORS, getSettings, updateSettings, clearSettingsSection, startAnnouncementChecks } from './shared.js';

let settingsConfig;

// Fetch settings configuration
async function loadSettingsConfig() {
  try {
    const response = await fetch('./settings-config.json');
    settingsConfig = await response.json();
    renderSettings();
  } catch (error) {
    console.error('Error loading settings configuration:', error);
    showNotification({
      message: 'Error loading settings configuration',
      color: COLORS.error
    });
  }
}

// Create an HTML element with attributes and properties
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  return element;
}

// Create control based on setting type
function createSettingControl(setting) {
  const settings = getSettings();
  
  switch (setting.type) {
    case 'color': {
      const container = createElement('div', { className: 'color-setting' });
      const input = createElement('input', {
        type: 'color',
        id: setting.id,
        value: settings[setting.id] || setting.defaultValue,
        onInput: (e) => {
          const color = e.target.value;
          updateSettings({ [setting.id]: color });
          updateUIColors(color);
        }
      });
      container.appendChild(input);

      if (setting.hasReset) {
        const resetButton = createElement('button', {
          className: 'small-button',
          onClick: () => {
            input.value = setting.defaultValue;
            updateSettings({ [setting.id]: setting.defaultValue });
            updateUIColors(setting.defaultValue);
            showNotification({ 
              message: `${setting.label} reset to default`, 
              color: setting.defaultValue 
            });
          }
        }, ['Reset to Default']);
        container.appendChild(resetButton);
      }
      
      return container;
    }

    case 'text': {
      const container = createElement('div', { className: 'text-setting' });
      const input = createElement('input', {
        type: 'text',
        id: setting.id,
        value: settings[setting.id] || '',
        placeholder: setting.placeholder || '',
        onInput: (e) => {
          const value = e.target.value.trim();
          updateSettings({ [setting.id]: value });
          if (setting.id === 'gistId') {
            startAnnouncementChecks();
          }
        }
      });

      if (setting.description) {
        const description = createElement('div', { className: 'setting-description' }, [setting.description]);
        container.appendChild(description);
      }

      container.appendChild(input);
      return container;
    }

    case 'action': {
      return createElement('button', {
        className: setting.style === 'danger' ? 'danger-button' : undefined,
        onClick: () => {
          showNotification({
            message: setting.confirmMessage,
            color: COLORS.warning,
            isPrompt: true,
            buttons: [
              {
                text: 'Yes',
                color: COLORS.error,
                action: () => {
                  clearSettingsSection(setting.settingsKey);
                  showNotification({ 
                    message: `${setting.label} completed`, 
                    color: COLORS.error 
                  });
                }
              },
              {
                text: 'No',
                color: COLORS.cancel
              }
            ]
          });
        }
      }, [setting.label]);
    }

    default:
      console.warn(`Unknown setting type: ${setting.type}`);
      return null;
  }
}

// Render all settings sections
function renderSettings() {
  const container = document.getElementById('settings-container');
  container.innerHTML = '';

  settingsConfig.sections.forEach(section => {
    const sectionElement = createElement('div', { className: 'settings-section' }, [
      createElement('h2', {}, [section.title])
    ]);

    section.settings.forEach(setting => {
      const settingItem = createElement('div', { className: 'setting-item' });
      
      if (setting.label && setting.type !== 'action') {
        settingItem.appendChild(createElement('label', { for: setting.id }, [setting.label]));
      }

      const control = createSettingControl(setting);
      if (control) {
        settingItem.appendChild(control);
      }

      sectionElement.appendChild(settingItem);
    });

    container.appendChild(sectionElement);
  });
}

// Initialize settings and start announcement checks
initializeUIColor();
loadSettingsConfig();
startAnnouncementChecks();