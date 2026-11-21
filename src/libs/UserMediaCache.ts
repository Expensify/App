/**
 * The service worker saves receipts, attachments and images in the user-media cache. The block marker is a cache too, because
 * Cache Storage is shared by pages and the worker and outlives a stopped worker, so a block holds until the app removes it.
 */
const USER_MEDIA_CACHE_NAME = 'user-media';
const USER_MEDIA_BLOCK_CACHE_NAME = 'user-media-blocked';

function isCacheStorageAvailable(): boolean {
    return typeof caches !== 'undefined';
}

/**
 * Stops the worker from saving media and deletes the media it saved. The marker is created first,
 * so a save that finishes after the delete still sees it and deletes the cache again.
 * The media is deleted even when the marker can't be created, so the previous session's files never stay behind.
 */
async function blockAndClearUserMedia(): Promise<void> {
    if (!isCacheStorageAvailable()) {
        return;
    }
    try {
        await caches.open(USER_MEDIA_BLOCK_CACHE_NAME);
    } finally {
        await caches.delete(USER_MEDIA_CACHE_NAME);
    }
}

async function unblockUserMedia(): Promise<void> {
    if (!isCacheStorageAvailable()) {
        return;
    }
    await caches.delete(USER_MEDIA_BLOCK_CACHE_NAME);
}

async function isUserMediaBlocked(): Promise<boolean> {
    if (!isCacheStorageAvailable()) {
        return false;
    }
    return caches.has(USER_MEDIA_BLOCK_CACHE_NAME);
}

export {USER_MEDIA_CACHE_NAME, blockAndClearUserMedia, unblockUserMedia, isUserMediaBlocked};
