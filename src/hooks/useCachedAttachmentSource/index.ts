import {AttachmentIDContext} from '@components/Attachments/AttachmentIDContext';

import useOnyx from '@hooks/useOnyx';

import {getAttachmentLocalSource, getCachedAttachment} from '@libs/actions/Attachment';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ImageSource} from 'expo-image';

import {useContext, useEffect, useRef, useState} from 'react';

function useCachedAttachmentSource(source: ImageSource | undefined): ImageSource | null | undefined {
    const uri = typeof source === 'object' ? source.uri : undefined;
    const {attachmentID} = useContext(AttachmentIDContext);
    const authToken = source?.headers?.[CONST.CHAT_ATTACHMENT_TOKEN_KEY];
    const [hasError, setHasError] = useState(false);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [hasSettled, setHasSettled] = useState(false);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${getNonEmptyStringOnyxID(attachmentID)}`);
    const objectURL = useRef<string | null>(null);

    useEffect(() => {
        setHasError(false);
        setHasSettled(false);

        if ((!authToken && !attachmentID) || !uri) {
            setCachedUri(null);
            return;
        }

        const localSource = getAttachmentLocalSource(attachmentID);
        if (localSource) {
            objectURL.current = localSource;
            setCachedUri(localSource);
            setHasSettled(true);
            return;
        }

        if (attachmentMetadata.status === 'loading') {
            return;
        }

        let cancelled = false;
        const previousObjectURL = objectURL.current;

        getCachedAttachment({uri, attachmentID, remoteSource: attachment?.remoteSource, authToken})
            .then((cachedSource) => {
                if (cancelled) {
                    return;
                }
                setHasSettled(true);

                if (!cachedSource) {
                    setHasError(true);
                    return;
                }

                // Revoke previous URL only after the new one is ready.
                if (previousObjectURL && previousObjectURL !== cachedSource) {
                    URL.revokeObjectURL(previousObjectURL);
                }

                objectURL.current = cachedSource;
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
    }, [uri, authToken, attachmentID, attachment?.remoteSource, attachmentMetadata.status]);

    // Skip if there's no attachmentID and auth token
    if (!authToken && !attachmentID) {
        return source;
    }

    // If caching failed, fall back to the original source so expo-image
    // handles it normally (including error reporting via onError)
    if (hasError) {
        return source;
    }

    // If cache fetch is still in progress and the current source
    // is coming from local source i.e blob:, return the current source
    if (uri?.startsWith('blob:') && !cachedUri) {
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

export default useCachedAttachmentSource;
