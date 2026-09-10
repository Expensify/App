import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';

import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

// Cached attachments are re-downloadable, so they live in Caches, which the OS may purge
// and which is never exposed to the user via the iOS Files app (unlike Documents)
const ATTACHMENT_DIR = `${RNFS.CachesDirectoryPath}/attachments`;

async function cacheAttachment({attachmentID, uri, mimeType}: CacheAttachmentProps) {
    const isLocalFile = uri.startsWith('file://');
    const fileExtension = getImageCacheFileExtension(mimeType ?? '');

    // For local file uploads and the file type is supported for caching, then copy instead of re-downloading the file
    if (isLocalFile && fileExtension) {
        const fileName = `${attachmentID}.${fileExtension}`;
        const destPath = `${ATTACHMENT_DIR}/${fileName}`;

        try {
            // The OS can purge Caches wholesale, so the directory may need recreating
            await RNFS.mkdir(ATTACHMENT_DIR);
            await RNFS.copyFile(uri, destPath);
            await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                source: destPath,
            });
        } catch (error) {
            Log.warn('[AttachmentCache] Failed to cache attachment', {error});
        }

        return;
    }

    try {
        // HEAD first to validate size and type before downloading
        const headResponse = await fetch(uri, {method: 'HEAD'});
        const contentType = headResponse.headers.get('content-type') ?? '';
        const contentSize = Number(headResponse.headers.get('content-length') ?? 0);

        // Exit if the attachment size is too large
        if (contentSize > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            Log.warn('[AttachmentCache] Attachment is too large, skipping cache', {attachmentID, contentSize});
            return;
        }

        const attachmentFileExtension = getImageCacheFileExtension(contentType ?? '');

        // If attachmentFileExtension is not set properly / or doesn't exist in our lists, then we need to exit
        if (!attachmentFileExtension) {
            Log.warn('[AttachmentCache] Unsupported file type, skipping cache', {attachmentID, contentType});
            return;
        }

        const fileName = `${attachmentID}.${attachmentFileExtension}`;
        const filePath = `${ATTACHMENT_DIR}/${fileName}`;
        // The OS can purge Caches wholesale, so the directory may need recreating
        await RNFS.mkdir(ATTACHMENT_DIR);
        await RNFetchBlob.config({path: filePath}).fetch('GET', uri);

        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            attachmentID,
            source: filePath,
            remoteSource: uri,
        });
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to cache attachment', {error});
    }
}

async function getCachedAttachment({attachmentID, attachment, currentSource}: GetCachedAttachmentProps) {
    const isStale = attachment ? attachment?.remoteSource && attachment.remoteSource !== currentSource : false;
    if (isStale) {
        // Only re-cache the [markdown-attachment] if it is outdated (updated)
        cacheAttachment({attachmentID, uri: currentSource});
        return currentSource;
    }

    const localSource = attachment?.source;
    if (localSource) {
        // The OS can purge Caches while the Onyx record survives, so verify the file still
        // exists. If it was purged, fall back to the current source and re-cache it.
        const localFileExists = await RNFS.exists(localSource);
        if (localFileExists) {
            // The path is stored without a scheme so RNFS file operations (exists/unlink) accept it, but
            // React Native's <Image> on Android only loads a local file when it carries a `file://`
            // scheme (a bare path renders as a broken thumbnail), so add the scheme before the path
            // reaches the image renderer.
            return localSource.startsWith('file://') ? localSource : `file://${localSource}`;
        }
        cacheAttachment({attachmentID, uri: currentSource});
    }

    return currentSource;
}

async function removeCachedAttachment({attachmentID, localSource}: RemoveCachedAttachmentProps): Promise<void> {
    if (!localSource) {
        return;
    }

    try {
        const exists = await RNFS.exists(localSource);
        if (exists) {
            await RNFS.unlink(localSource);
        }
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to remove cached attachment', {attachmentID, error});
    }
}

async function clearCachedAttachments(): Promise<void> {
    try {
        const exists = await RNFS.exists(ATTACHMENT_DIR);
        if (exists) {
            await RNFS.unlink(ATTACHMENT_DIR);
        }
        await Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to clear cached attachments', {error});
    }
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
