import {useEffect, useState} from 'react';
import {getCachedAttachment, removeCachedAttachment} from '@libs/actions/Attachment';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * A source is "optimistic-local" when it's a `blob:`/`file:` object URL. These are created for
 * not-yet-synced uploads and are revoked when the page unloads, so after a reload they resolve to
 * nothing and must be re-read from the cache.
 *
 * Note: we intentionally do NOT use `isLocalFile` here. That helper also treats root-relative remote
 * URLs (e.g. `/staging/chat-attachments/...`) as local, which would make us resolve already-synced
 * remote attachments from the cache and mint object URLs that can go stale on re-render.
 */
function isOptimisticLocalSource(source: string | undefined): boolean {
    return !!source && (source.startsWith('blob:') || source.startsWith('file:'));
}

/**
 * Resolves the displayed source for an attachment that may carry a stale optimistic local
 * (`blob:`/`file:`) URI. Object URLs are revoked when the page unloads, so the persisted src of an
 * attachment uploaded offline resolves to nothing after a reload. While the source is still that
 * optimistic URI, this reads the cached bytes back and returns a fresh object URL.
 *
 * Once the upload syncs, its src becomes a remote URL. At that point the server copy is authoritative,
 * so we return the source unchanged (it loads over the network) and drop the now-unneeded cached bytes
 * to avoid ever serving a stale copy.
 */
function useCachedAttachmentSource(attachmentID: string | undefined, source: string | undefined): string | undefined {
    const [attachment] = useOnyx(`${ONYXKEYS.COLLECTION.ATTACHMENT}${getNonEmptyStringOnyxID(attachmentID)}`);
    const isOptimisticSource = isOptimisticLocalSource(source);
    const shouldResolveFromCache = !!attachmentID && !!source && isOptimisticSource;

    // The cache read-back is asynchronous, so we only track the resolved source here and derive the
    // returned value below. While the read is pending (or when we shouldn't resolve from cache) we
    // fall back to the original source.
    const [cachedSource, setCachedSource] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!shouldResolveFromCache) {
            return;
        }

        let isActive = true;
        getCachedAttachment({attachmentID, attachment, currentSource: source})
            .then((resolvedSource) => {
                if (!isActive) {
                    return;
                }
                setCachedSource(resolvedSource);
            })
            .catch(() => {
                // Fall back to the current source if the cache read fails so we never leave a stale URI unresolved.
                if (!isActive) {
                    return;
                }
                setCachedSource(undefined);
            });

        return () => {
            isActive = false;
        };
    }, [shouldResolveFromCache, attachmentID, source, attachment]);

    // Once the attachment has synced (its src is a remote URL) but cached bytes still exist, drop them.
    // The server copy is now authoritative; keeping the cache would only risk serving a stale copy and
    // waste storage. This runs once — `attachment` becomes undefined after removal, so the guard exits.
    useEffect(() => {
        if (!attachmentID || !source || isOptimisticSource || !attachment) {
            return;
        }
        removeCachedAttachment({attachmentID, localSource: attachment.source});
    }, [attachmentID, source, isOptimisticSource, attachment]);

    if (!shouldResolveFromCache) {
        return source;
    }

    return cachedSource ?? source;
}

export default useCachedAttachmentSource;
