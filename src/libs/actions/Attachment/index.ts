import Onyx from 'react-native-onyx';
import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

async function cacheAttachment({attachmentID, uri}: CacheAttachmentProps): Promise<void> {
    try {
        const response = await fetch(uri);
        if (!response.ok) {
            Log.warn('[AttachmentCache] Failed to fetch attachment');
            return;
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (contentType === 'image/heic') {
            Log.warn('[AttachmentCache] HEIC is not supported, skipping cache', {attachmentID, contentType});
            return;
        }

        const fileExtension = getImageCacheFileExtension(contentType);

        // If the image file type doesn't exist in our list, then we need to exit
        if (!fileExtension) {
            Log.warn('[AttachmentCache] Unsupported file type, skipping cache', {attachmentID, contentType});
            return;
        }

        try {
            await CacheAPI.put(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID, response);
            await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                remoteSource: isLocalFile(uri) ? '' : uri,
            });
        } catch (error) {
            Log.warn('[AttachmentCache] Failed to cache attachment', {error});
        }
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to fetch attachment', {error});
    }
}

async function getCachedAttachment({attachmentID, attachment, currentSource}: GetCachedAttachmentProps): Promise<string> {
    const isStale = attachment ? attachment?.remoteSource && attachment.remoteSource !== currentSource : false;
    if (isStale) {
        // Only re-cache the [markdown-attachment] if it is outdated (updated)
        cacheAttachment({attachmentID, uri: currentSource});
        return currentSource;
    }

    const cachedAttachment = await CacheAPI.get(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID);
    const isUncached = !cachedAttachment;
    if (isUncached) {
        return currentSource;
    }

    try {
        const attachmentFile = await cachedAttachment.blob();
        return URL.createObjectURL(attachmentFile);
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to get attachment', {error});
        return currentSource;
    }
}

async function removeCachedAttachment({attachmentID}: RemoveCachedAttachmentProps) {
    try {
        await CacheAPI.remove(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to remove cached attachment', {error});
    }
}

async function clearCachedAttachments() {
    try {
        await CacheAPI.clear(CONST.CACHE_API_KEYS.ATTACHMENTS);
        await Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to clear cached attachments', {error});
    }
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
