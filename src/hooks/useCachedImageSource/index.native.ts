import type {ImageSource} from 'expo-image';
import {useContext, useEffect, useState} from 'react';
import {AttachmentIDContext} from '@components/Attachments/AttachmentIDContext';
import useOnyx from '@hooks/useOnyx';
import {getCachedAttachment} from '@libs/actions/Attachment';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const hasHeaders = typeof source === 'object' && !isEmptyObject(source.headers);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const {attachmentID} = useContext(AttachmentIDContext);
    const [attachment] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);

    useEffect(() => {
        setCachedUri(null);
        setHasError(false);

        // On native, expo-image handles auth headers natively — no caching needed
        // Only cache non-auth attachments (images with attachmentID but no headers)
        if (!attachmentID || hasHeaders || !uri) {
            return;
        }

        let revoked = false;

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
                }
            })
            .catch((error) => {
                if (!revoked) {
                    setHasError(true);
                }
                const errorMessage = error.message ?? error?.toString();
                Log.hmmm(errorMessage);
            });

        return () => {
            revoked = true;
        };
    }, [uri, hasHeaders, attachmentID, attachment, source]);

    // Auth images (with headers) are passed through directly — expo-image
    // handles headers natively on React Native, so no caching needed
    if (hasHeaders) {
        return source;
    }

    // Non-auth images without attachmentID pass through as-is
    if (!attachmentID) {
        return source;
    }

    // If caching failed, fall back to the original source
    if (hasError) {
        return source;
    }

    // Cache fetch is still in progress
    if (!cachedUri) {
        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
