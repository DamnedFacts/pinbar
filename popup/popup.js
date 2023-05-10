

// Save settings function
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings from local storage if they exist
  const apiTokenInput = document.getElementById('api-token');
  const tagsToSyncInput = document.getElementById('tags-to-sync');
  const updateIntervalInput = document.getElementById('update-interval');

  apiTokenInput.value = localStorage.getItem('tempApiToken') || '';
  tagsToSyncInput.value = localStorage.getItem('tempTagsToSync') || '';
  updateIntervalInput.value = localStorage.getItem('tempUpdateInterval') || '';

  // Update local storage when user types
  apiTokenInput.addEventListener('input', (e) => {
    localStorage.setItem('tempApiToken', e.target.value);
  });

  tagsToSyncInput.addEventListener('input', (e) => {
    localStorage.setItem('tempTagsToSync', e.target.value);
  });

  updateIntervalInput.addEventListener('input', (e) => {
    localStorage.setItem('tempUpdateInterval', e.target.value);
  });

  // Save settings button
  const saveSettingsButton = document.getElementById('save-settings');
  saveSettingsButton.addEventListener('click', async () => {
    const apiToken = apiTokenInput.value.trim();
    const tagsToSync = tagsToSyncInput.value.trim();
    const updateInterval = parseInt(updateIntervalInput.value.trim());

    await browser.storage.sync.set({ apiToken, tagsToSync, updateInterval });

    // Clear temp settings from local storage
    localStorage.removeItem('tempApiToken');
    localStorage.removeItem('tempTagsToSync');
    localStorage.removeItem('tempUpdateInterval');

    // Trigger sync
    await browser.runtime.sendMessage({ action: 'SYNC_NOW' });

    // Close popup
    window.close();
  });
});

// Save settings function
function saveSettings() {
  const apiToken = document.querySelector("#api-token").value;
  const tagsToSync = document.querySelector("#tags-to-sync").value.split(",").map((tag) => tag.trim());
  const updateInterval = parseInt(document.querySelector("#update-interval").value, 10);

  // Save settings to browser storage
  browser.storage.local.set({ apiToken, tagsToSync, updateInterval });
}

// Load settings function
function loadSettings() {
  browser.storage.local.get(["apiToken", "tagsToSync", "updateInterval"]).then((settings) => {
    document.querySelector("#api-token").value = settings.apiToken || "";
    document.querySelector("#tags-to-sync").value = settings.tagsToSync ? settings.tagsToSync.join(", ") : "";
    document.querySelector("#update-interval").value = settings.updateInterval || "";
  });
}

// Form submission event
document.querySelector("#settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  saveSettings();
});

// Sync Now button click event
document.querySelector("#sync-now").addEventListener("click", () => {
  saveSettings();
  // Send a one-time message to the background script to sync bookmarks
  browser.runtime.sendMessage({ action: "syncBookmarks" });
});

// Load saved settings when the popup is opened
loadSettings();

