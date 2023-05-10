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

async function syncBookmarksToSubfolder(pinbarFolderId, tagSet, bookmarks) {
  const subfolderName = tagSet.replace(/\s+/g, '-');
  const subfolderId = await createOrUpdateSubfolder(pinbarFolderId, subfolderName);
  const bookmarksForTagSet = bookmarks.filter((bookmark) =>
    tagSet.every((tag) => bookmark.tags.split(' ').includes(tag))
  );

  await addOrUpdateBookmarksInFolder(subfolderId, bookmarksForTagSet);
}

export async function syncBookmarksToPinbarFolder(pinbarFolderId, bookmarks, tagsToSync) {
  for (const tagSet of tagsToSync) {
    const tagSetString = tagSet.join('-');
    const bookmarksToSync = bookmarks.filter((bookmark) => isBookmarkInTagSet(bookmark, tagSet));
    await syncBookmarksToSubfolder(pinbarFolderId, bookmarksToSync, tagSetString);
  }
}

async function addOrUpdateBookmarksInFolder(folderId, bookmarks) {
  const existingBookmarks = await browser.bookmarks.getChildren(folderId);

  for (const bookmark of bookmarks) {
    const existingBookmark = existingBookmarks.find((b) => b.url === bookmark.href);
    if (existingBookmark) {
      if (existingBookmark.title !== bookmark.description) {
        await browser.bookmarks.update(existingBookmark.id, { title: bookmark.description });
      }
    } else {
      await browser.bookmarks.create({
        parentId: folderId,
        title: bookmark.description,
        url: bookmark.href,
      });
    }
  }

  // Remove bookmarks that are no longer in the bookmarks list
  for (const existingBookmark of existingBookmarks) {
    if (!bookmarks.some((b) => b.href === existingBookmark.url)) {
      await browser.bookmarks.remove(existingBookmark.id);
    }
  }
}

