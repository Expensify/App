import {AttachmentIDContext} from '@components/Attachments/AttachmentIDContext';

import useOnyx from '@hooks/useOnyx';

import {getAttachmentLocalSource, getCachedAttachment} from '@libs/actions/Attachment';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ImageSource} from 'expo-image';

import {useContext, useEffect, useState} from 'react';

function useCachedImageSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const {attachmentID} = useContext(AttachmentIDContext);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [hasSettled, setHasSettled] = useState(false);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);

    useEffect(() => {
        setHasError(false);
        setHasSettled(false);

        if (!attachmentID || !uri) {
            setCachedUri(null);
            return;
        }

        const localSource = getAttachmentLocalSource(attachmentID);
        if (localSource) {
            setCachedUri(localSource);
            setHasSettled(true);
            return;
        }

        if (attachmentMetadata.status === 'loading') {
            return;
        }

        let cancelled = false;

        getCachedAttachment({uri, attachmentID, localSource: attachment?.source})
            .then((cachedSource) => {
                if (cancelled) {
                    return;
                }

                setHasSettled(true);
                if (!cachedSource) {
                    setHasError(true);
                    return;
                }

                setCachedUri(cachedSource);
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }
                setHasSettled(true);
                setHasError(true);
                Log.hmmm('[AttachmentCache] Failed to get cached attachment', {message: (error as Error).message});
            });

        return () => {
            cancelled = true;
        };
    }, [uri, attachmentID, attachment?.source, attachmentMetadata.status]);

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

    // If cache fetch is still in progress, check if we have a local source
    // from the upload (uploader case) and show it instead of blocking
    if (!cachedUri) {
        const localSource = getAttachmentLocalSource(attachmentID);
        if (localSource) {
            return {uri: localSource};
        }

        if (hasSettled) {
            return source;
        }

        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
