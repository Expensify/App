import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import {getMimeTypeFromUri, isLocalFile} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

const ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/attachments`;

async function cacheAttachment({uri, attachmentID, sourceHeaders, fileType}: CacheAttachmentProps): Promise<string | undefined> {
    const isAuthRemoteAttachment = !isEmptyObject(sourceHeaders);
    const isMarkdownAttachment = isEmptyObject(sourceHeaders) && !isLocalFile(uri);

    // Cache file-upload only to prevent flash bug, because remote/external attachments are automatically cached by expo-image
    const shouldSkipCaching = isAuthRemoteAttachment || isMarkdownAttachment;

    if (!uri || shouldSkipCaching || !attachmentID) {
        return;
    }

    // Create attachment directory if it's not yet exists
    const isAttachmentDirExists = await RNFS.exists(ATTACHMENT_DIR);
    if (!isAttachmentDirExists) {
        await RNFS.mkdir(ATTACHMENT_DIR);
    }

    const mimeType = getMimeTypeFromUri(uri) ?? fileType;
    const fileExtension = getImageCacheFileExtension(mimeType ?? '');

    // For local file uploads and the file type is supported for caching, then copy instead of re-downloading the file
    if (isLocalFile(uri) && fileExtension) {
        const fileName = `${attachmentID}.${fileExtension}`;
        const destPath = `${ATTACHMENT_DIR}/${fileName}`;

        try {
            // For safety, to prevent any failures
            if (await RNFS.exists(destPath)) {
                await RNFS.unlink(destPath);
            }
            await RNFS.copyFile(uri, destPath);
            await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                source: destPath,
            });

            return destPath;
        } catch (error) {
            throw new Error('[AttachmentCache] Failed to cache attachment');
        }
    }

    try {
        // HEAD first to validate size and type before downloading
        const headResponse = await fetch(uri, {method: 'HEAD'});
        const contentType = mimeType ?? headResponse.headers.get('content-type') ?? '';
        const contentSize = Number(headResponse.headers.get('content-length') ?? 0);

        // Exit if the attachment size is too large
        if (contentSize > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            throw new Error('[AttachmentCache] Attachment is too large, skipping cache');
        }

        const attachmentFileExtension = getImageCacheFileExtension(contentType);

        // If attachmentFileExtension is not set properly / or doesn't exist in our lists, then we need to exit
        if (!attachmentFileExtension) {
            throw new Error('[AttachmentCache] Unsupported file type, skipping cache');
        }

        const fileName = `${attachmentID}.${attachmentFileExtension}`;
        const filePath = `${ATTACHMENT_DIR}/${fileName}`;
        await RNFetchBlob.config({path: filePath}).fetch('GET', uri);

        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            attachmentID,
            source: filePath,
            remoteSource: uri,
        });

        return filePath;
    } catch (error) {
        throw new Error('[AttachmentCache] Failed to cache attachment');
    }
}

async function getCachedAttachment({uri, attachment}: GetCachedAttachmentProps) {
    if (!uri) {
        return;
    }
    const cachedSource = attachment?.source;
    const isCached = cachedSource && (await RNFS.exists(cachedSource));
    if (!isCached) {
        return;
    }

    return `file://${cachedSource}`;
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
        Log.hmmm(`[AttachmentCache] Failed to remove cached attachment: ${attachmentID}`, {message: (error as Error).message});
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
        Log.hmmm('[AttachmentCache] Failed to clear cached attachments', {message: (error as Error).message});
    }
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
