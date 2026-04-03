import type {ImageSource} from 'expo-image';
import {useEffect, useState} from 'react';
import {clearPreloadedBlobURLs, getPreloadedBlobURL} from '@libs/AuthImagesPreloader';
import Log from '@libs/Log';
import CONST from '@src/CONST';

/** Revokes all in-memory blob URLs and deletes the Cache API store. Called on logout / session expiry. */
const clearAuthImagesCache = async () => {
    if (!('caches' in window)) {
        return;
    }

    clearPreloadedBlobURLs();

    try {
        await caches.delete(CONST.CACHE_NAME.AUTH_IMAGES);
    } catch (error) {
        Log.alert('[AuthImageCache] Error clearing auth image cache:', {message: (error as Error).message});
    }
};

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;

    // Synchronously resolve from the preload map if available (no flash)
    const preloadedUrl = uri ? getPreloadedBlobURL(uri) : undefined;

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
export {clearAuthImagesCache};
