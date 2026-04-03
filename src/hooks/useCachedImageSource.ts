import type {ImageSource} from 'expo-image';
import {useEffect, useState} from 'react';
import Log from '@libs/Log';
import CONST from '@src/CONST';

/** In-memory map of image URI → preloaded blob URL, managed externally via preloadAuthImage/revokeCachedAuthImage */
const preloadedBlobURLs = new Map<string, string>();

/** Incremented on each preload batch and on cleanup; stale batches check this before writing to the map */
let preloadRunID = 0;

/** Returns the shared preloaded blob URL map so callers can check which URIs are already cached or iterate for cleanup. */
const getPreloadedBlobURLs = () => {
    return preloadedBlobURLs;
};

/** Revokes all in-memory blob URLs and deletes the Cache API store. Called on logout / session expiry. */
const clearAuthImagesCache = async () => {
    if (!('caches' in window)) {
        return;
    }

    for (const blobURL of preloadedBlobURLs.values()) {
        URL.revokeObjectURL(blobURL);
    }
    preloadedBlobURLs.clear();

    try {
        await caches.delete(CONST.CACHE_NAME.AUTH_IMAGES);
    } catch (error) {
        Log.alert('[AuthImageCache] Error clearing auth image cache:', {message: (error as Error).message});
    }
};

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

                if (runID !== preloadRunID) {
                    return;
                }

                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);
                preloadedBlobURLs.set(uri, objectURL);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    await clearAuthImagesCache();
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
    for (const blobURL of preloadedBlobURLs.values()) {
        URL.revokeObjectURL(blobURL);
    }
    preloadedBlobURLs.clear();
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

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;

    // Synchronously resolve from the preload map if available (no flash)
    const preloadedUrl = uri ? preloadedBlobURLs.get(uri) : undefined;

    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Skip the async path if the preload map already has a blob URL
        if (preloadedUrl) {
            return;
        }

        setCachedUri(null);
        setHasError(false);

        if (!hasHeaders || !uri) {
            return;
        }

        let revoked = false;
        let objectURL: string | undefined;

        (async () => {
            try {
                const cache = await caches.open(CONST.CACHE_NAME.AUTH_IMAGES);
                const cachedResponse = await cache.match(uri);

                if (cachedResponse) {
                    const blob = await cachedResponse.blob();
                    objectURL = URL.createObjectURL(blob);
                    if (!revoked) {
                        setCachedUri(objectURL);
                    } else {
                        URL.revokeObjectURL(objectURL);
                    }
                    return;
                }

                const response = await fetch(uri, {headers: source.headers});

                if (!response.ok) {
                    if (!revoked) {
                        setHasError(true);
                    }
                    return;
                }

                // Store in cache before consuming
                await cache.put(uri, response.clone());

                const blob = await response.blob();
                objectURL = URL.createObjectURL(blob);
                if (!revoked) {
                    setCachedUri(objectURL);
                } else {
                    URL.revokeObjectURL(objectURL);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    await clearAuthImagesCache();
                }
                if (!revoked) {
                    setHasError(true);
                }
            }
        })();

        return () => {
            revoked = true;
            // Only revoke blob URLs that this hook instance created, not preloaded ones
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
    }, [uri, hasHeaders, source?.headers, preloadedUrl]);

    // Images without headers are cached natively by the browser,
    // so pass them through as-is — no Cache API needed
    if (!hasHeaders) {
        return source;
    }

    // If a preloaded blob URL exists, use it directly (synchronous, no flash)
    if (preloadedUrl) {
        return {uri: preloadedUrl};
    }

    // If caching failed, fall back to the original source so expo-image
    // handles it normally (including error reporting via onError)
    if (hasError) {
        return source;
    }

    // Cache fetch is still in progress — return null so expo-image doesn't
    // render the image with headers (which would bypass our cache)
    if (!cachedUri) {
        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
export {clearAuthImagesCache, preloadAuthImages, revokeCachedAuthImage, getPreloadedBlobURLs, clearPreloadedBlobURLs};
