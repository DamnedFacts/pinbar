import { loadSettings } from './settings.js';
import { fetchAllBookmarks } from './pinboard.js';
import { syncBookmarksToPinbarFolder  } from './bookmarks.js';

browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === 'syncBookmarks') {
    await syncBookmarksToPinbarFolder();
  }
});

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncBookmarksAlarm') {
    await syncBookmarksToPinbarFolder();
  }
});

(async () => {
  const { apiToken, tagsToSync, updateInterval } = await loadSettings();

  if (apiToken && tagsToSync && updateInterval) {
    syncBookmarksToPinbarFolder();

    browser.alarms.create('syncBookmarksAlarm', {
      periodInMinutes: updateInterval,
    });
  }
})();

