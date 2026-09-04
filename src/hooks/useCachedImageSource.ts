import Log from '@libs/Log';

import CONST from '@src/CONST';

import type {ImageSource} from 'expo-image';

import {useEffect, useRef, useState} from 'react';

const clearAuthImagesCache = async () => {
    if (!('caches' in window)) {
        return;
    }

    try {
        await caches.delete(CONST.CACHE_NAME.AUTH_IMAGES);
    } catch (error) {
        Log.alert('[AuthImageCache] Error clearing auth image cache:', {message: (error as Error).message});
    }
};

/** What the hook already resolved for the uri it currently shows. An undefined blob means resolving that uri failed. */
type ResolvedImage = {uri: string; blob: Blob | undefined};

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    // The resolution outlives an effect cleanup, so a screen that <Activity> covers and reveals keeps the image it
    // already resolved instead of blanking it and looking the same uri up again.
    const resolvedImageRef = useRef<ResolvedImage | undefined>(undefined);

    useEffect(() => {
        const resolvedImage = resolvedImageRef.current;

        if (hasHeaders && uri && resolvedImage?.uri === uri) {
            const retainedBlob = resolvedImage.blob;
            if (!retainedBlob) {
                return;
            }

            // The previous cleanup revoked the object URL of an image that stayed on screen, so this run mints a new
            // URL for the blob it still holds. Nothing is fetched and the source never passes through null.
            const restoredObjectURL = URL.createObjectURL(retainedBlob);
            setCachedUri(restoredObjectURL);

            return () => {
                URL.revokeObjectURL(restoredObjectURL);
            };
        }

        resolvedImageRef.current = undefined;
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
                    resolvedImageRef.current = {uri, blob};
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
                        resolvedImageRef.current = {uri, blob: undefined};
                        setHasError(true);
                    }
                    return;
                }

                // Store in cache before consuming
                await cache.put(uri, response.clone());

                const blob = await response.blob();
                resolvedImageRef.current = {uri, blob};
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
                    resolvedImageRef.current = {uri, blob: undefined};
                    setHasError(true);
                }
            }
        })();

        return () => {
            revoked = true;
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
        // A fresh `source.headers` object on every render must not re-resolve an image whose uri never changed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri, hasHeaders]);

    // Images without headers are cached natively by the browser,
    // so pass them through as-is — no Cache API needed
    if (!hasHeaders) {
        return source;
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
