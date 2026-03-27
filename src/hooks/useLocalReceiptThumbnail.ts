import {useEffect, useState, useTransition} from 'react';
import {generateThumbnail} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';

const thumbnailCache = new Map<string, string>();

/**
 * Generates a low-resolution thumbnail for a local receipt image.
 * State updates are wrapped in startTransition so React deprioritizes
 * the re-render and doesn't interrupt navigation animations.
 */
function useLocalReceiptThumbnail(sourceUri: string | undefined, isLocalFile: boolean, enabled = true): {thumbnailUri: string | undefined; isGenerating: boolean} {
    const [thumbnailUri, setThumbnailUri] = useState<string | undefined>(() => (sourceUri ? thumbnailCache.get(sourceUri) : undefined));
    const [isGenerating, setIsGenerating] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (!sourceUri || !isLocalFile || !enabled) {
            return;
        }

        const cached = thumbnailCache.get(sourceUri);
        if (cached) {
            setThumbnailUri(cached);
            return;
        }

        setIsGenerating(true);

        let cancelled = false;
        generateThumbnail(sourceUri).then((uri) => {
            if (cancelled) {
                return;
            }
            if (uri) {
                thumbnailCache.set(sourceUri, uri);
            }
            startTransition(() => {
                if (uri) {
                    setThumbnailUri(uri);
                }
                setIsGenerating(false);
            });
        });

        return () => {
            cancelled = true;
            thumbnailCache.delete(sourceUri);
        };
    }, [sourceUri, isLocalFile, startTransition, enabled]);

    return {thumbnailUri, isGenerating};
}

export default useLocalReceiptThumbnail;
