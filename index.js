import { showNotification, COLORS, getSettings, updateSettings } from './shared.js';

// DOM Elements
const site = document.getElementById("site");
const quickTiles = document.getElementById('quickTiles');
const addTileButton = document.getElementById('addTile');
const tileEditor = document.getElementById('tileEditor');
const tileText = document.getElementById('tileText');
const tileUrl = document.getElementById('tileUrl');
const saveTileButton = document.getElementById('saveTile');
const cancelTileButton = document.getElementById('cancelTile');
let selectedColor = COLORS.success;
try {
// Check for selected proxy
const selectedProxy = JSON.parse(localStorage.getItem('selectedProxy'));
if (!selectedProxy) {
  window.location.href = 'sites.html';
  console.warn('No proxy site selected');
}
if (selectedProxy) {
  document.getElementById('selectedSite').textContent = `Using: ${selectedProxy.name || selectedProxy.host}`;
}
// URL handling
function toURL(input) {
  try {
    const url = new URL(input);
    return url.href;
  } catch {
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(input)) {
      return 'https://' + input;
    }
    return 'https://www.google.com/search?q=' + encodeURIComponent(input);
  }
}

// Codec handling
async function getCodec(name) {
  if (!name) {
    console.error('No codec name provided');
    showNotification({ 
      message: 'Error: No codec specified', 
      color: COLORS.error 
    });
    return null;
  }

  try {
    const { getCodec } = await import('./codecs.js?{{ site.github.build_revision }}');
    const codec = getCodec(name);
    
    if (!codec) {
      console.error(`Codec '${name}' not found`);
      showNotification({ 
        message: `Error: Invalid codec '${name}'`, 
        color: COLORS.error 
      });
      return null;
    }
    return codec;
  } catch (e) {
    console.error('Error loading codec:', e);
    showNotification({ 
      message: 'Error: Failed to load codec module', 
      color: COLORS.error 
    });
    return null;
  }
}

// Bypass functionality
async function bypass() {
  if (!selectedProxy) {
    showNotification({ 
      message: 'Please select a proxy site first', 
      color: COLORS.warning 
    });
    window.location.href = 'sites.html';
    return;
  }

  const codec = selectedProxy.codec;
  let result;
  let toencode = toURL(site.value);
  
  try {
    const codecObj = await getCodec(codec);
    if (codecObj && typeof codecObj.encode === "function") {
      result = codecObj.encode(toencode);
    } else {
      showNotification({ 
        message: 'Server Error: Invalid codec', 
        color: COLORS.error 
      });
      return;
    }
  } catch (e) {
    console.error('Error during bypass:', e);
    showNotification({ 
      message: 'Server Error: Failed to encode URL', 
      color: COLORS.error 
    });
    return;
  }

  if (!selectedProxy.host || !result) {
    showNotification({ 
      message: 'Please enter both host and site URL', 
      color: COLORS.warning 
    });
    return;
  }
  
  window.open(`${selectedProxy.host}${result}`, '_blank');
  showNotification({ 
    message: 'Bypass link opened in new tab', 
    color: COLORS.success 
  });
}

// Quick Tiles Management
function loadQuickTiles() {
  const { quickTiles: tiles } = getSettings();
  quickTiles.innerHTML = '';
  tiles.forEach((tile, index) => {
    const tileButton = document.createElement('button');
    tileButton.className = 'quick-tile';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'quick-tile-text';
    textSpan.textContent = tile.text;
    tileButton.appendChild(textSpan);
    
    tileButton.style.background = tile.color || '#f4f4f4';
    tileButton.addEventListener('click', () => {
      site.value = tile.url;
      bypass();
      site.value = '';
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-tile';
    deleteButton.textContent = 'remove';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      showNotification({
        message: `Are you sure you want to delete the "${tile.text}" tile?`,
        color: COLORS.warning,
        isPrompt: true,
        buttons: [
          {
            text: 'Yes',
            color: COLORS.error,
            action: () => {
              const settings = getSettings();
              settings.quickTiles.splice(index, 1);
              updateSettings(settings);
              loadQuickTiles();
              showNotification({ 
                message: 'Quick access tile removed',
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
    });

    tileButton.appendChild(deleteButton);
    quickTiles.appendChild(tileButton);
  });
}

// Event Listeners
site.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("bypassbutton").click();
  }
});

document.getElementById("bypassbutton").addEventListener("click", bypass);

document.querySelectorAll('.color-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedColor = option.dataset.color;
    showNotification({ message: 'Color selected', color: selectedColor });
  });
});

document.querySelector('.color-option').classList.add('selected');

addTileButton.addEventListener('click', () => {
  tileEditor.style.display = 'block';
  addTileButton.style.display = 'none';
  tileText.value = '';
  tileUrl.value = '';
  selectedColor = COLORS.success;
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.color === selectedColor);
  });
});

cancelTileButton.addEventListener('click', () => {
  tileEditor.style.display = 'none';
  addTileButton.style.display = 'block';
});

saveTileButton.addEventListener('click', () => {
  const text = tileText.value.trim();
  const url = tileUrl.value.trim();

  if (!text || !url) {
    showNotification({
      message: 'Please enter both display text and URL',
      color: COLORS.warning
    });
    return;
  }

  const settings = getSettings();
  settings.quickTiles.push({ text, url, color: selectedColor });
  updateSettings(settings);
  
  tileEditor.style.display = 'none';
  addTileButton.style.display = 'block';
  loadQuickTiles();
  showNotification({
    message: 'Quick access tile added',
    color: COLORS.success
  });
});

loadQuickTiles();
}catch (e) {
  console.error('Error in main script:', e);
  alert(e);
}