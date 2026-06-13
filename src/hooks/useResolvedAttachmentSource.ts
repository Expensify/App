import {useEffect, useState} from 'react';
import type {ImageSourcePropType} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import {getCachedAttachment} from '@userActions/Attachment';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type UseResolvedAttachmentSourceParams = {
    /** Attachment ID from data-attachment-id attribute */
    attachmentID?: string;

    /** Current source URL (may be a stale blob: URL after page refresh) */
    source: string | ImageSourcePropType;
};

type UseResolvedAttachmentSourceReturn = {
    /** Resolved source — either the original or a fresh object URL from cache */
    resolvedSource: string | ImageSourcePropType;

    /** Whether we're still resolving from cache */
    isLoading: boolean;
};

/**
 * Resolves an attachment source, attempting to recover from a stale blob: URL
 * by reading the cached attachment bytes via getCachedAttachment.
 *
 * On page refresh, the browser revokes all blob: object URLs, so optimistic
 * attachment previews that used blob: URIs become broken. This hook detects
 * that case and re-mints a fresh object URL from the attachment cache.
 */
function useResolvedAttachmentSource({attachmentID, source}: UseResolvedAttachmentSourceParams): UseResolvedAttachmentSourceReturn {
    const [attachment] = useOnyx(attachmentID ? `${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}` : undefined);
    const [resolvedSource, setResolvedSource] = useState<string | ImageSourcePropType>(source);
    const [isLoading, setIsLoading] = useState(false);

    const sourceStr = typeof source === 'string' ? source : source?.uri ?? '';

    useEffect(() => {
        // Only attempt cache resolution when:
        // 1. We have an attachmentID
        // 2. The current source is a blob: or file: URL (stale after refresh)
        // 3. The source is a string
        if (!attachmentID || !sourceStr || !sourceStr.startsWith('blob:') || typeof source !== 'string') {
            setResolvedSource(source);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        (async () => {
            const cachedSource = await getCachedAttachment({
                attachmentID,
                attachment,
                currentSource: sourceStr,
            });

            if (!cancelled) {
                setResolvedSource(cachedSource);
                setIsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [attachmentID, sourceStr, source, attachment]);

    return {resolvedSource, isLoading};
}

export default useResolvedAttachmentSource;
