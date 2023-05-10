import { getSettings } from './settings.js';
import { fetchAllBookmarks } from './pinboard.js';
import { syncBookmarks  } from './bookmarks.js';

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

