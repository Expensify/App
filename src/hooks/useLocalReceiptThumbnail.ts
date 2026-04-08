import {useEffect, useRef, useState, useTransition} from 'react';
import {Image} from 'react-native';
import {generateThumbnail} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';

const thumbnailCache = new Map<string, string>();
/** Track how many mounted hook instances reference each sourceUri */
const thumbnailRefCount = new Map<string, number>();

function retainUri(uri: string) {
    thumbnailRefCount.set(uri, (thumbnailRefCount.get(uri) ?? 0) + 1);
}

function releaseUri(uri: string) {
    const count = (thumbnailRefCount.get(uri) ?? 1) - 1;
    if (count <= 0) {
        thumbnailRefCount.delete(uri);
        thumbnailCache.delete(uri);
    } else {
        thumbnailRefCount.set(uri, count);
    }
}

/**
 * Pre-populate the thumbnail cache so the confirm screen can use it
 * synchronously on first render, avoiding any source swap / flash.
 */
function pregenerateThumbnail(sourceUri: string): Promise<string | undefined> {
    if (thumbnailCache.has(sourceUri)) {
        return Promise.resolve(thumbnailCache.get(sourceUri));
    }
    return generateThumbnail(sourceUri).then((uri) => {
        if (uri) {
            thumbnailCache.set(sourceUri, uri);
            // Pre-decode the thumbnail in the native image pipeline so the
            // confirmation screen can display it instantly without decode latency.
            Image.prefetch(uri);
        }
        return uri;
    });
}

/**
 * Returns a cached low-resolution thumbnail for a local receipt image.
 * The thumbnail should be pre-generated via `pregenerateThumbnail` before
 * navigating to the confirm screen. If it wasn't, this hook generates it
 * as a fallback, but in that case a source swap (flash) may occur.
 */
function useLocalReceiptThumbnail(sourceUri: string | undefined, isLocalFile: boolean): {thumbnailUri: string | undefined; isGenerating: boolean} {
    const [asyncResult, setAsyncResult] = useState<{source: string; uri?: string; done: boolean} | undefined>();
    const [, startTransition] = useTransition();
    const retainedUriRef = useRef<string | undefined>(undefined);

    // Resolve cached thumbnails synchronously during render (fast path)
    const cachedUri = sourceUri ? thumbnailCache.get(sourceUri) : undefined;
    const resultForCurrentSource = asyncResult?.source === sourceUri ? asyncResult : undefined;
    const thumbnailUri = cachedUri ?? resultForCurrentSource?.uri;

    const shouldGenerate = !!sourceUri && isLocalFile && !cachedUri;
    const isGenerating = shouldGenerate && !resultForCurrentSource?.done;

    // Retain / release the cache entry so it lives as long as at least one
    // mounted hook instance references it, and is cleaned up after the last
    // consumer unmounts.
    useEffect(() => {
        if (!sourceUri || !isLocalFile) {
            return;
        }

        retainUri(sourceUri);
        retainedUriRef.current = sourceUri;

        return () => {
            releaseUri(sourceUri);
            retainedUriRef.current = undefined;
        };
    }, [sourceUri, isLocalFile]);

    // Fallback: generate if not already in cache (e.g. gallery pick path)
    useEffect(() => {
        if (!sourceUri || !isLocalFile || thumbnailCache.has(sourceUri)) {
            return;
        }

        let cancelled = false;
        generateThumbnail(sourceUri)
            .then((uri) => {
                if (cancelled) {
                    return;
                }
                if (uri) {
                    thumbnailCache.set(sourceUri, uri);
                }
                startTransition(() => {
                    setAsyncResult({source: sourceUri, uri: uri ?? undefined, done: true});
                });
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }
                setAsyncResult({source: sourceUri, done: true});
            });

        return () => {
            cancelled = true;
        };
    }, [sourceUri, isLocalFile, startTransition]);

    return {thumbnailUri, isGenerating};
}

export {pregenerateThumbnail};
export default useLocalReceiptThumbnail;
