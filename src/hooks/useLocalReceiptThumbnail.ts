import {generateThumbnail} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';

import {useEffect, useRef, useState, useTransition} from 'react';

import useReceiptUpgradeCount from './useReceiptUpgradeCount';

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
 * Pre-populate the receipt-image cache so the confirm screen can use it
 * synchronously on first render, avoiding any source swap / flash.
 */
function precacheReceiptImage(sourceUri: string) {
    if (thumbnailCache.has(sourceUri)) {
        return;
    }
    thumbnailCache.set(sourceUri, sourceUri);
}

/**
 * Returns a cached receipt image URI for a local receipt. The image should be
 * pre-cached via `precacheReceiptImage` before navigating to the confirm screen.
 * If it wasn't, this hook generates a thumbnail as a fallback, but in that case
 * a source swap (flash) may occur.
 */
function useLocalReceiptThumbnail(sourceUri: string | undefined, isLocalFile: boolean): {thumbnailUri: string | undefined; isGenerating: boolean} {
    const [asyncResult, setAsyncResult] = useState<{source: string; uri?: string; done: boolean} | undefined>();
    const [, startTransition] = useTransition();
    const retainedUriRef = useRef<string | undefined>(undefined);

    // A receipt swapped for a better capture keeps its path, so the image loaders would serve the decode
    // they already have. Counting the upgrades gives the same file a source they treat as new.
    const upgradeCount = useReceiptUpgradeCount(sourceUri);

    // Resolve cached thumbnails synchronously during render (fast path)
    const cachedUri = sourceUri ? thumbnailCache.get(sourceUri) : undefined;
    const resultForCurrentSource = asyncResult?.source === sourceUri ? asyncResult : undefined;
    const resolvedUri = cachedUri ?? resultForCurrentSource?.uri;
    // The suffix is for the image loaders only. Nothing stores it, so a view handed this source can pass it
    // back in without the receipt losing its identity.
    const thumbnailUri = resolvedUri && upgradeCount > 0 ? `${resolvedUri.split('#').at(0) ?? resolvedUri}#upgraded${upgradeCount}` : resolvedUri;

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

export {precacheReceiptImage};
export default useLocalReceiptThumbnail;
