const site = document.getElementById("site");

function showNotification(message, timeout = 3000, color = '#00c100') {
  const notification = document.getElementById('notification');
  if (!notification) {
    console.error('Notification element not found');
    return;
  }
  notification.textContent = message;
  notification.style.background = color;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, timeout);
}

const selectedProxy = JSON.parse(sessionStorage.getItem('selectedProxy'));
if (!selectedProxy) {
  window.location.href = 'sites.html';
}

document.getElementById('selectedSite').textContent = `Using: ${selectedProxy.name || selectedProxy.host}`;

site.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("bypassbutton").click();
  }
});

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

async function getCodec(name) {
  if (!name) {
    console.error('No codec name provided');
    showNotification('Error: No codec specified', 3000, '#ff4444');
    return null;
  }

  try {
    const { getCodec } = await import('./codecs.js?{{ site.github.build_revision }}');
    const codec = getCodec(name);
    
    if (!codec) {
      console.error(`Codec '${name}' not found`);
      showNotification(`Error: Invalid codec '${name}'`, 3000, '#ff4444');
      return null;
    }

    return codec;
  } catch (e) {
    console.error('Error loading codec:', e);
    showNotification('Error: Failed to load codec module', 3000, '#ff4444');
    return null;
  }
}

async function bypass() {
  if (!selectedProxy) {
    showNotification('Please select a proxy site first', 3000, '#ff9800');
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
      showNotification('Server Error: Invalid codec', 3000, '#ff4444');
      return;
    }
  } catch (e) {
    console.error('Error during bypass:', e);
    showNotification('Server Error: Failed to encode URL', 3000, '#ff4444');
    return;
  }

  if (!selectedProxy.host || !result) {
    showNotification('Please enter both host and site URL', 3000, '#ff9800');
    return;
  }
  
  window.open(`${selectedProxy.host}${result}`, '_blank');
  showNotification('Bypass link opened in new tab', 3000, '#00c100');
}

document.getElementById("bypassbutton").addEventListener("click", () => bypass());

// Quick access tile functionality
const quickTiles = document.getElementById('quickTiles');
const addTileButton = document.getElementById('addTile');
const tileEditor = document.getElementById('tileEditor');
const tileText = document.getElementById('tileText');
const tileUrl = document.getElementById('tileUrl');
const saveTileButton = document.getElementById('saveTile');
const cancelTileButton = document.getElementById('cancelTile');
let selectedColor = '#009900';

function loadQuickTiles() {
  const tiles = JSON.parse(localStorage.getItem('quickTiles') || '[]');
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
      site.value = ``;
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-tile';
    deleteButton.textContent = 'remove';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      tiles.splice(index, 1);
      localStorage.setItem('quickTiles', JSON.stringify(tiles));
      loadQuickTiles();
      showNotification('Quick access tile removed');
    });

    tileButton.appendChild(deleteButton);
    quickTiles.appendChild(tileButton);
  });
}

// Color picker functionality
document.querySelectorAll('.color-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedColor = option.dataset.color;
  });
});

// Select default color
document.querySelector('.color-option').classList.add('selected');

addTileButton.addEventListener('click', () => {
  tileEditor.style.display = 'block';
  addTileButton.style.display = 'none';
  tileText.value = '';
  tileUrl.value = '';
  selectedColor = '#009900';
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
    showNotification('Please enter both display text and URL', 3000, '#ff9800');
    return;
  }

  const tiles = JSON.parse(localStorage.getItem('quickTiles') || '[]');
  tiles.push({ text, url, color: selectedColor });
  localStorage.setItem('quickTiles', JSON.stringify(tiles));
  
  tileEditor.style.display = 'none';
  addTileButton.style.display = 'block';
  loadQuickTiles();
  showNotification('Quick access tile added', 3000, '#00c100');
});

// Load tiles on page load
loadQuickTiles();