import {useNavigation} from '@react-navigation/native';
import type {ImageSource} from 'expo-image';
import {useContext, useEffect, useRef, useState} from 'react';
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
    const [hasError, setHasError] = useState(false);
    const [cachedUri, setCachedUri] = useState<string | null>(null);
    const [attachment, attachmentMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`);
    const isUnmounted = useRef(false);
    const objectURL = useRef<string | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            isUnmounted.current = false;
        });
        const unsubscribeBlur = navigation.addListener('blur', () => {
            isUnmounted.current = true;
        });
        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    useEffect(() => {
        setCachedUri(null);
        setHasError(false);

        if ((!hasHeaders && !attachmentID) || !uri) {
            return;
        }

        if (attachmentMetadata.status === 'loading') {
            return;
        }

        getCachedAttachment({uri, attachmentID, attachment, sourceHeaders: source?.headers})
            .then((cachedSource) => {
                if (!cachedSource) {
                    if (!isUnmounted.current) {
                        setHasError(true);
                    }
                    return;
                }
                if (objectURL.current) {
                    URL.revokeObjectURL(objectURL.current);
                }

                objectURL.current = cachedSource;
                if (!isUnmounted.current) {
                    setCachedUri(objectURL.current);
                } else {
                    URL.revokeObjectURL(objectURL.current);
                }
            })
            .catch((error) => {
                if (!isUnmounted.current) {
                    setHasError(true);

                    if (objectURL.current) {
                        URL.revokeObjectURL(objectURL.current);
                    }
                }
                Log.hmmm('[AttachmentCache] Failed to get cached attachment', {message: (error as Error).message});
            });

        return () => {
            if (objectURL.current) {
                URL.revokeObjectURL(objectURL.current);
                objectURL.current = null;
            }
        };
    }, [uri, hasHeaders, attachment, attachmentMetadata.status, attachmentID, source?.headers]);

    // Skip if there's no attachmentID and headers
    if (!hasHeaders && !attachmentID) {
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

    // If cache fetch is still in progress — return null so expo-image doesn't
    // render the remote source (which would bypass our cache)
    if (!cachedUri) {
        return null;
    }

    return {uri: cachedUri};
}

export default useCachedImageSource;
