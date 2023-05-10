async function fetchBookmarksForTag(apiToken, tag) {
  const url = `https://api.pinboard.in/v1/posts/all?auth_token=${apiToken}&format=json&tag=${encodeURIComponent(tag)}`;
  const response = await fetch(url);
  return await response.json();
}

export async function fetchAllBookmarks(apiToken, tagsToSync) {
  const allBookmarks = [];
  for (const tag of tagsToSync) {
    const bookmarks = await fetchBookmarksForTag(apiToken, tag);
    allBookmarks.push(...bookmarks);
  }
  return allBookmarks;
}

