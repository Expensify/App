import {useEffect, useState, useTransition} from 'react';
import {generateThumbnail} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';

const thumbnailCache = new Map<string, string>();

/**
 * Generates a low-resolution thumbnail for a local receipt image.
 * State updates are wrapped in startTransition so React deprioritizes
 * the re-render and doesn't interrupt navigation animations.
 */
function useLocalReceiptThumbnail(sourceUri: string | undefined, isLocalFile: boolean, enabled = true): {thumbnailUri: string | undefined; isGenerating: boolean} {
    // Stores the async generation result, tagged with the sourceUri it was generated for.
    // This avoids synchronous setState inside effects — all derivation happens during render.
    const [asyncResult, setAsyncResult] = useState<{source: string; uri?: string; done: boolean} | undefined>();
    const [, startTransition] = useTransition();

    // Resolve cached thumbnails synchronously during render
    const cachedUri = sourceUri ? thumbnailCache.get(sourceUri) : undefined;
    const resultForCurrentSource = asyncResult?.source === sourceUri ? asyncResult : undefined;
    const thumbnailUri = cachedUri ?? resultForCurrentSource?.uri;

    const shouldGenerate = !!sourceUri && isLocalFile && enabled && !cachedUri;
    const isGenerating = shouldGenerate && !resultForCurrentSource?.done;

    useEffect(() => {
        if (!sourceUri || !isLocalFile || !enabled || thumbnailCache.has(sourceUri)) {
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
            thumbnailCache.delete(sourceUri);
        };
    }, [sourceUri, isLocalFile, startTransition, enabled]);

    return {thumbnailUri, isGenerating};
}

export default useLocalReceiptThumbnail;
