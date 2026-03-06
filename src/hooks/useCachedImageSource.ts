import type {ImageSource} from 'expo-image';
import {useEffect, useState} from 'react';

const CACHE_NAME = 'auth-images';

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setCachedUri(null);
        setHasError(false);

        if (!hasHeaders || !uri) {
            return;
        }

        let revoked = false;
        let objectURL: string | undefined;

        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
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
            } catch {
                if (!revoked) {
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
    }, [uri, hasHeaders, source?.headers]);

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
