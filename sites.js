const host = document.getElementById("host");
const codecs = document.getElementById("codec");
const preset = document.getElementById("preset");
const customInputs = document.getElementById("customInputs");
const savedSitesGroup = document.getElementById("savedSites");

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

function loadSavedSites() {
  const saved = JSON.parse(localStorage.getItem('savedSites') || '[]');
  savedSitesGroup.innerHTML = '';
  saved.forEach((site, index) => {
    const option = document.createElement('option');
    option.value = `saved_${index}`;
    option.textContent = site.name || site.host;
    savedSitesGroup.appendChild(option);
  });

  if (saved.length === 0) {
    savedSitesGroup.style.display = 'none';
  } else {
    savedSitesGroup.style.display = 'block';
  }
}

function saveCustomSite() {
  const siteName = document.getElementById('siteName').value.trim();
  const hostValue = host.value.trim();
  if (!hostValue || !siteName) {
    showNotification('Please fill in both site name and host URL', 3000, '#ff9800');
    return;
  }

  const saved = JSON.parse(localStorage.getItem('savedSites') || '[]');
  saved.push({
    name: siteName,
    host: hostValue,
    codec: codecs.value
  });

  localStorage.setItem('savedSites', JSON.stringify(saved));
  loadSavedSites();
  document.getElementById('siteName').value = '';
  showNotification('Custom site saved successfully', 3000, '#00c100');
}

document.getElementById('saveCustom').addEventListener('click', saveCustomSite);

let presetData = [];
fetch('./presets.json?{{ site.github.build_revision }}')
  .then(response => response.json())
  .then(data => {
    presetData = data.presets;
  })
  .catch(error => console.error('Error loading presets:', error));

preset.addEventListener("change", () => {
  const saved = JSON.parse(localStorage.getItem('savedSites') || '[]');
  const savedIndex = preset.value.match(/^saved_(\d+)$/);

  if (savedIndex) {
    const site = saved[savedIndex[1]];
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
    showNotification('Please select a proxy site first', 3000, '#ff9800');
    return;
  }
  
  if (preset.value === 'custom' && (!host.value || host.value.trim() === '')) {
    showNotification('Please enter a valid proxy URL', 3000, '#ff4444');
    return;
  }

  const selectedSite = {
    host: host.value,
    codec: codecs.value,
    name: preset.selectedOptions[0].text
  };
  
  sessionStorage.setItem('selectedProxy', JSON.stringify(selectedSite));
  window.location.href = 'index.html';
});

loadSavedSites();