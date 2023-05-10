import { saveSettings } from '../background/settings.js';


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
  saveButton.addEventListener('click', async () => {
    const settings = {
      apiToken: apiTokenInput.value,
      tagsToSync: tagsToSyncInput.value,
      updateIntervalMinutes: parseInt(updateIntervalInput.value, 10),
    };
    await saveSettings(settings);
    browser.runtime.sendMessage({ action: 'syncBookmarks' });
  });
});

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

