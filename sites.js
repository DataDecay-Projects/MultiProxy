import { showNotification, COLORS, getSettings, updateSettings } from './shared.js';

const host = document.getElementById("host");
const codecs = document.getElementById("codec");
const preset = document.getElementById("preset");
const customInputs = document.getElementById("customInputs");
const savedSitesGroup = document.getElementById("savedSites");

function getSavedSites() {
  return getSettings().savedSites;
}

function saveSites(sites) {
  updateSettings({ savedSites: sites });
}

function loadSavedSites() {
  const saved = getSavedSites();
  savedSitesGroup.innerHTML = '';
  saved.forEach((site, index) => {
    const option = document.createElement('option');
    option.value = `saved_${index}`;
    option.textContent = site.name || site.host;
    savedSitesGroup.appendChild(option);
  });

  savedSitesGroup.style.display = saved.length === 0 ? 'none' : 'block';
}

function saveCustomSite() {
  const siteName = document.getElementById('siteName').value.trim();
  const hostValue = host.value.trim();
  if (!hostValue || !siteName) {
    showNotification({
      message: 'Please fill in both site name and host URL',
      color: COLORS.warning
    });
    return;
  }

  const saved = getSavedSites();
  const existingSite = saved.find(site => site.name === siteName);
  
  if (existingSite) {
    showNotification({
      message: `A site with name "${siteName}" already exists. Do you want to update it?`,
      color: COLORS.warning,
      isPrompt: true,
      buttons: [
        {
          text: 'Yes',
          color: COLORS.success,
          action: () => {
            existingSite.host = hostValue;
            existingSite.codec = codecs.value;
            saveSites(saved);
            loadSavedSites();
            document.getElementById('siteName').value = '';
            showNotification({
              message: 'Custom site updated successfully',
              color: COLORS.success
            });
          }
        },
        {
          text: 'No',
          color: COLORS.cancel
        }
      ]
    });
    return;
  }

  saved.push({
    name: siteName,
    host: hostValue,
    codec: codecs.value
  });

  saveSites(saved);
  loadSavedSites();
  document.getElementById('siteName').value = '';
  showNotification({
    message: 'Custom site saved successfully',
    color: COLORS.success
  });
}

// Event handlers
document.getElementById('saveCustom').addEventListener('click', saveCustomSite);

function populatePresetDropdown(presets, includes) {
  // Clear existing preset options (except the default, custom, and saved sites sections)
  const presetsGroup = document.querySelector('optgroup[label="Presets"]');
  const incognitoGroup = document.querySelector('optgroup[label="Incognito (slow)"]');
  
  if (presetsGroup) presetsGroup.innerHTML = '';
  if (incognitoGroup) incognitoGroup.innerHTML = '';
  
  // Group presets by type using the includes property
  const standardPresets = presets.filter(p => {
    const lowerName = p.name.toLowerCase();
    return !includes.some(include => lowerName.includes(include.toLowerCase()));
  });
  
  const incogPresets = presets.filter(p => {
    const lowerName = p.name.toLowerCase();
    return includes.some(include => lowerName.includes(include.toLowerCase()));
  });
  
  // Add standard presets
  if (presetsGroup) {
    standardPresets.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      presetsGroup.appendChild(option);
    });
  }
  
  // Add incognito presets
  if (incognitoGroup) {
    incogPresets.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      incognitoGroup.appendChild(option);
    });
  }
}

let presetData = [];
let includesData = [];
fetch('./presets.json?v=' + Math.round((Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5))).toString(36).slice(1))
  .then(response => response.json())
  .then(data => {
    presetData = data.presets;
    includesData = data.includes || [];
    populatePresetDropdown(presetData, includesData);
  })
  .catch(error => console.error('Error loading presets:', error));

preset.addEventListener("change", () => {
  const savedIndex = preset.value.match(/^saved_(\d+)$/);

  if (savedIndex) {
    const site = getSavedSites()[savedIndex[1]];
    host.value = site.host;
    codecs.value = site.codec;
    customInputs.style.display = "none";
    return;
  }

  const selectedPreset = presetData.find(p => p.id === preset.value);
  if (selectedPreset) {
    host.value = selectedPreset.host;
    codecs.value = selectedPreset.codec;
    customInputs.style.display = "none";
  } else if (preset.value === "custom") {
    host.value = "";
    codecs.value = "plain";
    customInputs.style.display = "block";
  }
});

document.getElementById('selectSite').addEventListener('click', () => {
  if (preset.value === "" || (!preset.value && customInputs.style.display === 'none')) {
    showNotification({
      message: 'Please select a proxy site first',
      color: COLORS.warning
    });
    return;
  }
  
  if (preset.value === 'custom' && (!host.value || host.value.trim() === '')) {
    showNotification({
      message: 'Please enter a valid proxy URL',
      color: COLORS.error
    });
    return;
  }

  const selectedSite = {
    host: host.value,
    codec: codecs.value,
    name: preset.selectedOptions[0].text
  };
  
  localStorage.setItem('selectedProxy', JSON.stringify(selectedSite));
  window.location.href = 'index.html';
});

loadSavedSites();