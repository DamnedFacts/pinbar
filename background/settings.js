// Define DEFAULT_UPDATE_INTERVAL_MINUTES
const DEFAULT_UPDATE_INTERVAL_MINUTES = 5;

export async function saveSettings(apiToken, tagsToSync, updateIntervalMinutes) {
  try {
    await browser.storage.sync.set({
      apiToken: apiToken,
      tagsToSync: tagsToSync,
      updateIntervalMinutes: updateIntervalMinutes,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function loadSettings() {
    const settings = await browser.storage.sync.get(['apiToken', 'tagsToSync', 'updateIntervalMinutes']);
    return {
      apiToken: settings.apiToken || '',
      tagsToSync: settings.tagsToSync || '', // Update this line to match the storage key
      updateIntervalMinutes: settings.updateIntervalMinutes || DEFAULT_UPDATE_INTERVAL_MINUTES,
    };
}

