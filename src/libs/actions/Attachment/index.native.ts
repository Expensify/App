import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import {cleanFileName, getMimeTypeFromUri, isLocalFile} from '@libs/fileDownload/FileUtils';
import fileURIToPath from '@libs/fileURIToPath';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';

import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps, StageAttachmentProps} from './types';

const ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/${CONST.ATTACHMENT_DIR_NAME}`;

const attachmentLocalSources = new Map<string, string>();

/** Absolute path to the single durable directory used for both staging and previewing attachments. */
function getAttachmentDir(): string {
    return ATTACHMENT_DIR;
}

/** Ensures the attachments directory exists; safe to call concurrently. */
async function ensureAttachmentDir(): Promise<void> {
    if (await RNFS.exists(ATTACHMENT_DIR)) {
        return;
    }
    await RNFS.mkdir(ATTACHMENT_DIR).catch(() => {});
}

/**
 * Moves a freshly captured/picked file from its ephemeral OS cache location into the durable
 * `attachments/` directory so it survives an iOS Library/Caches purge until the upload completes.
 *
 * This replaces the old `moveReceiptToDurableStorage` + `Receipts-Upload` path. Staging into the
 * same directory that `cacheAttachment` later caches into lets `cacheAttachment` reuse the file
 * instead of copying it again — which is what eliminates the duplicate on disk.
 */
async function stageAttachment({uri, fileName}: StageAttachmentProps): Promise<string> {
    if (!uri || !isLocalFile(uri)) {
        return uri;
    }

    try {
        await ensureAttachmentDir();

        const sourcePath = fileURIToPath(uri);

        // Sanitize the on-disk name so the returned file:// URI never contains characters (#, %, space)
        // that make it ambiguous whether the string is percent-encoded. The user-visible filename
        // travels separately on the file object's name field and is not affected.
        const safeName = cleanFileName(fileName ?? CONST.DEFAULT_ATTACHMENT_FILENAME);
        const dotIndex = safeName.lastIndexOf('.');
        const uniqueName = dotIndex > 0 ? `${safeName.slice(0, dotIndex)}_${rand64()}${safeName.slice(dotIndex)}` : `${safeName}_${rand64()}`;
        const destPath = `${ATTACHMENT_DIR}/${uniqueName}`;

        await RNFS.moveFile(sourcePath, destPath);

        return `file://${destPath}`;
    } catch (error) {
        Log.warn('[AttachmentCache] Failed to stage attachment, using original URI', {error: error instanceof Error ? error.message : String(error)});
        return uri;
    }
}

function getAttachmentLocalSource(attachmentID: string | undefined): string | undefined {
    if (!attachmentID) {
        return undefined;
    }
    return attachmentLocalSources.get(attachmentID);
}

async function cacheAttachment({uri, attachmentID, authToken, fileType}: CacheAttachmentProps): Promise<string | undefined> {
    const isAuthRemoteAttachment = !!authToken;
    const isMarkdownAttachment = !authToken && !isLocalFile(uri);

    // Cache file-upload only to prevent flash bug, because remote/external attachments are automatically cached by expo-image
    const shouldSkipCaching = isAuthRemoteAttachment || isMarkdownAttachment;

    if (!uri || shouldSkipCaching || !attachmentID) {
        return;
    }

    // Ensure the attachment directory exists; ignore errors if a concurrent call already created it
    if (!(await RNFS.exists(ATTACHMENT_DIR))) {
        await RNFS.mkdir(ATTACHMENT_DIR).catch(() => {});
    }

    // If the file was already staged inside the attachments directory (by stageAttachment, or by
    // the camera writing its capture directly here), reuse it as the cache entry instead of copying
    // or re-downloading. This is what prevents the same file from existing twice on disk.
    const stagedPath = fileURIToPath(uri);
    if (stagedPath.startsWith(`${ATTACHMENT_DIR}/`) && (await RNFS.exists(stagedPath))) {
        const stagedUri = uri.startsWith('file://') ? uri : `file://${stagedPath}`;
        attachmentLocalSources.set(attachmentID, stagedUri);
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            attachmentID,
            source: stagedPath,
        });
        return stagedPath;
    }

    const mimeType = getMimeTypeFromUri(uri) ?? fileType;
    const fileExtension = getImageCacheFileExtension(mimeType ?? '');

    // For local file uploads and the file type is supported for caching, then copy instead of re-downloading the file
    if (isLocalFile(uri) && fileExtension) {
        const fileName = `${attachmentID}.${fileExtension}`;
        const destPath = `${ATTACHMENT_DIR}/${fileName}`;

        try {
            // Save local URI so it can be rendered while caching is in progress
            attachmentLocalSources.set(attachmentID, uri);

            await RNFS.copyFile(uri, destPath);

            await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                source: destPath,
            });

            // Update local source to the cached file path
            attachmentLocalSources.set(attachmentID, `file://${destPath}`);

            return destPath;
        } catch (error) {
            // Clean up local source reference on failure
            attachmentLocalSources.delete(attachmentID);
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

        // Update local source to the cached file path
        attachmentLocalSources.set(attachmentID, filePath);

        return filePath;
    } catch (error) {
        // Clean up local source reference on failure
        attachmentLocalSources.delete(attachmentID);
        throw new Error('[AttachmentCache] Failed to cache attachment');
    }
}

async function getCachedAttachment({uri, attachmentID, localSource}: GetCachedAttachmentProps) {
    if (!uri || !attachmentID) {
        return;
    }

    const localUri = attachmentLocalSources.get(attachmentID);
    if (localUri) {
        // RNFS.exists expects a raw filesystem path, not a file:// URI
        const filePath = localUri.startsWith('file://') ? localUri.slice('file://'.length) : localUri;
        const exists = await RNFS.exists(filePath);
        if (exists) {
            return localUri.startsWith('file://') ? localUri : `file://${localUri}`;
        }
        // File no longer exists — remove stale entry and fall through
        attachmentLocalSources.delete(attachmentID);
    }

    if (localSource) {
        const isCached = await RNFS.exists(localSource);
        if (!isCached) {
            removeCachedAttachment({attachmentID, localSource});
            return;
        }
        return `file://${localSource}`;
    }
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
        attachmentLocalSources.delete(attachmentID);
    } catch (error) {
        Log.hmmm(`[AttachmentCache] Failed to remove cached attachment: ${attachmentID}`, {message: error instanceof Error ? error.message : String(error)});
    }
}

async function clearCachedAttachments(): Promise<void> {
    try {
        const exists = await RNFS.exists(ATTACHMENT_DIR);
        if (exists) {
            await RNFS.unlink(ATTACHMENT_DIR);
        }
        await Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
        attachmentLocalSources.clear();
    } catch (error) {
        Log.hmmm('[AttachmentCache] Failed to clear cached attachments', {
            message: error instanceof Error ? error.message : String(error),
        });
    }
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments, getAttachmentLocalSource, getAttachmentDir, ensureAttachmentDir, stageAttachment};
