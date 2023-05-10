async function fetchBookmarks(apiToken, tags) {
  const url = `https://api.pinboard.in/v1/posts/all?auth_token=${apiToken}&format=json&tag=${tags}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching bookmarks: ${response.statusText}`);
  }
  return await response.json();
}


async function getOrCreatePinbarFolder() {
  const searchResults = await browser.bookmarks.search({ title: 'Pinbar' });

  if (searchResults.length > 0) {
    return searchResults[0].id;
  }

  const toolbar = await browser.bookmarks.getToolbar();
  const pinbarFolder = await browser.bookmarks.create({
    parentId: toolbar[0].id,
    title: 'Pinbar',
  });

  return pinbarFolder.id;
}

async function createOrUpdateSubfolder(parentId, title) {
  const searchResults = await browser.bookmarks.search({ title });
  const matchingBookmarks = searchResults.filter((bookmark) => bookmark.parentId === parentId);

  if (matchingBookmarks.length > 0) {
    return matchingBookmarks[0].id;
  }

  const subfolder = await browser.bookmarks.create({
    parentId,
    title,
  });

  return subfolder.id;
}

function isBookmarkWithTagSet(bookmark, tagSet) {
  const bookmarkTags = bookmark.tags.split(' ');
  return tagSet.every(tag => bookmarkTags.includes(tag));
}

export async function syncBookmarksToPinbarFolder(apiToken, tagsToSync, pinbarFolder) {
  const bookmarkUrlToIdMap = new Map();

  for (const tagSet of tagsToSync) {
    const encodedTags = encodeURIComponent(tagSet);
    const bookmarks = await fetchBookmarks(apiToken, encodedTags);
    const subfolder = await createOrUpdateSubfolder(pinbarFolder.id, tagSet.replace(' ', '-'));

    for (const bookmark of bookmarks) {
      const existingBookmarkId = bookmarkUrlToIdMap.get(bookmark.href);
      if (existingBookmarkId) {
        await moveBookmark(existingBookmarkId, subfolder.id);
      } else {
        const createdBookmark = await createBookmark(subfolder.id, bookmark);
        bookmarkUrlToIdMap.set(bookmark.href, createdBookmark.id);
      }
    }
  }
}

