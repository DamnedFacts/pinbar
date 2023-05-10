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

export async function syncBookmarksToPinbarFolder(pinbarFolderId, tagsToSync, settings) {
  for (const tagSet of tagsToSync) {
    const tagSetString = tagSet.join('-');
    const subfolderId = await createOrUpdateSubfolder(pinbarFolderId, tagSetString);
    await syncBookmarksForTagSet(subfolderId, tagSet, settings);
  }
}

async function syncBookmarksForTagSet(folderId, tagSet, settings) {
  const fetchedBookmarks = await fetchBookmarks(tagSet, settings.apiToken);
  const currentBookmarks = await getBookmarksInFolder(folderId);

  const bookmarksToRemove = currentBookmarks.filter(
    (bookmark) => !fetchedBookmarks.some((fetched) => fetched.url === bookmark.url)
  );
  const bookmarksToUpdate = currentBookmarks.filter((bookmark) =>
    fetchedBookmarks.some((fetched) => fetched.url === bookmark.url)
  );
  const bookmarksToAdd = fetchedBookmarks.filter(
    (fetched) => !currentBookmarks.some((bookmark) => bookmark.url === fetched.url)
  );

  await Promise.all(bookmarksToRemove.map((bookmark) => browser.bookmarks.remove(bookmark.id)));
  await Promise.all(
    bookmarksToUpdate.map((bookmark) =>
      browser.bookmarks.update(bookmark.id, {
        title: bookmark.title,
      })
    )
  );
  await Promise.all(
    bookmarksToAdd.map((bookmark) =>
      browser.bookmarks.create({
        parentId: folderId,
        title: bookmark.description,
        url: bookmark.href,
      })
    )
  );
}

