import { getSettings } from './settings.js';
import { fetchAllBookmarks } from './pinboard.js';
import { syncBookmarksToPinbarFolder } from './bookmarks.js';

async function syncBookmarks() {
  const { apiToken, tagsToSyncRaw, updateIntervalMinutes } = await getSettings();

  const tagsToSync = tagsToSyncRaw.split(',').map(tag => tag.trim());

  if (!apiToken || tagsToSync.length === 0) {
    return;
  }

  const allBookmarks = await fetchAllBookmarks(apiToken, tagsToSync);
  await syncBookmarksToPinbarFolder(apiToken, allBookmarks, tagsToSync);
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'syncBookmarks') {
    await syncBookmarks();
  }
});

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncBookmarksAlarm') {
    await syncBookmarks();
  }
});

(async () => {
  const { apiToken, tagsToSync, updateInterval } = await getSettings();

  if (apiToken && tagsToSync && updateInterval) {
    syncBookmarks();

    browser.alarms.create('syncBookmarksAlarm', {
      periodInMinutes: updateInterval,
    });
  }
})();

