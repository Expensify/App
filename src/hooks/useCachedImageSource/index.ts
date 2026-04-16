import type {ImageSource} from 'expo-image';
import {useContext, useEffect, useState} from 'react';
import {AttachmentIDContext} from '@components/Attachments/AttachmentIDContext';
import useOnyx from '@hooks/useOnyx';
import {getCachedAttachment} from '@libs/actions/Attachment';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !!source.headers;
    const {attachmentID} = useContext(AttachmentIDContext);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);

    useEffect(() => {
        setCachedUri(null);
        setHasError(false);

        if ((!hasHeaders && !attachmentID) || !uri) {
            return;
        }

        if (attachmentID && attachmentMetadata.status === 'loading') {
            return;
        }

        let revoked = false;
        let objectURL: string | undefined;

        getCachedAttachment({attachmentID, attachment, source})
            .then((cachedSource) => {
                if (!cachedSource) {
                    if (!revoked) {
                        setHasError(true);
                    }
                    return;
                }
                if (!revoked) {
                    setCachedUri(cachedSource);
                } else {
                    URL.revokeObjectURL(cachedSource);
                }
            })
            .catch(() => {
                if (!revoked) {
                    setHasError(true);
                }
                // TODO: Improve error loging
                Log.hmmm('[AttachmentCache] Failed to get cached attachment');
            });

        return () => {
            revoked = true;
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
    }, [uri, hasHeaders, source?.headers, attachment, attachmentMetadata.status, attachmentID, source]);

    // Images without headers are cached natively by the browser,
    // so pass them through as-is — no Cache API needed
    if (!hasHeaders && !attachmentID) {
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
