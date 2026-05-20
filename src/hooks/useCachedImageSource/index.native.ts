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
    const {attachmentID} = useContext(AttachmentIDContext);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);

    useEffect(() => {
        setCachedUri(null);
        setHasError(false);

        // On native, expo-image handles remote/auth attachments natively — no caching needed
        if (!attachmentID || !uri) {
            return;
        }

        if (attachmentMetadata.status === 'loading') {
            return;
        }

        let revoked = false;

        getCachedAttachment({uri, attachmentID, attachment, sourceHeaders: source?.headers})
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
                Log.hmmm('[AttachmentCache] Failed to get cached attachment', {message: (error as Error).message});
            });

        return () => {
            revoked = true;
        };
    }, [uri, hasHeaders, attachmentID, attachment, attachmentMetadata.status, source?.headers]);

    // Skip if there's no attachmentID, because expo-image
    // already handle remote attachments natively
    if (!attachmentID) {
        return source;
    }

    // If caching failed, fall back to the original source
    if (hasError) {
        return source;
    }

    // If cache fetch is still in progress and the current source
    // is coming from local source i.e file://, return the current source
    if (uri?.startsWith('file:') && !cachedUri) {
        return source;
    }

    // If cache fetch is still in progress — return null so expo-image doesn't
    // render the remote source (which would bypass our cache)
    if (!cachedUri) {
        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
