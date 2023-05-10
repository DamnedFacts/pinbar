// Define DEFAULT_UPDATE_INTERVAL_MINUTES
const DEFAULT_UPDATE_INTERVAL_MINUTES = 5;

export async function saveSettings(settings) {
  await browser.storage.sync.set(settings);
}

export async function getSettings() {
  const settings = await browser.storage.sync.get(['apiToken', 'tagsToSync', 'updateInterval']);
  return {
    apiToken: settings.apiToken || '',
    tagsToSyncRaw: settings.tagsToSync || '', // Update this line to match the storage key
    updateInterval: settings.updateInterval || DEFAULT_UPDATE_INTERVAL_MINUTES, // Use the same property name
  };
}

