import CONST from '@src/CONST';

/** In-memory map of image URI → preloaded blob URL, managed via preloadAuthImages/revokeCachedAuthImage */
const preloadedBlobURLs = new Map<string, string>();

/** Incremented on each preload batch and on cleanup; stale batches check this before writing to the map */
let preloadRunID = 0;

/** Returns the shared preloaded blob URL map so callers can check which URIs are already cached or iterate for cleanup. */
function getPreloadedBlobURLs() {
    return preloadedBlobURLs;
}

/** Looks up a preloaded blob URL for the given URI, or returns undefined. */
function getPreloadedBlobURL(uri: string): string | undefined {
    return preloadedBlobURLs.get(uri);
}

/**
 * Revokes all in-memory blob URLs.
 */
function revokeAllBlobURLs() {
    for (const blobURL of preloadedBlobURLs.values()) {
        URL.revokeObjectURL(blobURL);
    }
    preloadedBlobURLs.clear();
}

/**
 * Fetches authenticated images, stores them in the Cache API, creates blob URLs,
 * and pins them in the in-memory map so useCachedImageSource can resolve them synchronously.
 */
function preloadAuthImages(uris: string[], headers: Record<string, string>) {
    if (!('caches' in window)) {
        return;
    }

    const runID = ++preloadRunID;

    Promise.all(
        uris.map(async (uri): Promise<void> => {
            if (preloadedBlobURLs.has(uri)) {
                return;
            }

            try {
                const cache = await caches.open(CONST.CACHE_NAME.AUTH_IMAGES);
                let response = await cache.match(uri);

                if (!response) {
                    response = await fetch(uri, {headers});
                    if (!response.ok) {
                        return;
                    }
                    await cache.put(uri, response.clone());
                }

                const blob = await response.blob();

                if (runID !== preloadRunID) {
                    return;
                }

                const objectURL = URL.createObjectURL(blob);
                preloadedBlobURLs.set(uri, objectURL);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    revokeAllBlobURLs();
                    await caches.delete(CONST.CACHE_NAME.AUTH_IMAGES);
                }
            }
        }),
    );
}

/**
 * Invalidates all in-flight preloads and revokes every blob URL in the map.
 * Stale batches see a mismatched preloadRunID after their next await and bail out,
 * so no late-completing fetch can repopulate the map after this call.
 */
function clearPreloadedBlobURLs() {
    preloadRunID++;
    revokeAllBlobURLs();
}

/**
 * Revokes preloaded blob URL for the given image URI and removes it from the in-memory map.
 * Call when an image leaves the preload window (no longer prev/next).
 */
function revokeCachedAuthImage(uri: string) {
    const blobURL = preloadedBlobURLs.get(uri);
    if (blobURL) {
        URL.revokeObjectURL(blobURL);
        preloadedBlobURLs.delete(uri);
    }
}

export {preloadAuthImages, revokeCachedAuthImage, getPreloadedBlobURLs, getPreloadedBlobURL, clearPreloadedBlobURLs};
