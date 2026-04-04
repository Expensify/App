import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

const ATTACHMENT_DIR = `${RNFS.DocumentDirectoryPath}/attachments`;

async function cacheAttachment({attachmentID, source, mimeType}: CacheAttachmentProps): Promise<string | undefined> {
    const uri = source.uri;
    const isAuthRemoteAttachment = !isEmptyObject(source.headers);

    if (!uri || isAuthRemoteAttachment || !attachmentID) {
        return;
    }

    // create attachment directory if it's not yet exists, else don't
    const isAttachmentDirExists = await RNFS.exists(ATTACHMENT_DIR);
    if (!isAttachmentDirExists) {
        await RNFS.mkdir(ATTACHMENT_DIR);
    }

    const isLocalFile = uri.startsWith('file://');
    const fileExtension = getImageCacheFileExtension(mimeType ?? '');

    // For local file uploads and the file type is supported for caching, then copy instead of re-downloading the file
    if (isLocalFile && fileExtension) {
        const fileName = `${attachmentID}.${fileExtension}`;
        const destPath = `${ATTACHMENT_DIR}/${fileName}`;

        try {
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
        const contentType = headResponse.headers.get('content-type') ?? '';
        const contentSize = Number(headResponse.headers.get('content-length') ?? 0);

        // Exit if the attachment size is too large
        if (contentSize > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            throw new Error('[AttachmentCache] Attachment is too large, skipping cache');
        }

        const attachmentFileExtension = getImageCacheFileExtension(contentType ?? '');

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

async function getCachedAttachment({attachmentID, attachment, source}: GetCachedAttachmentProps) {
    if (isEmptyObject(source) || !source.uri || !isEmptyObject(source.headers)) {
        return;
    }
    const imageSource = source.uri;

    if (!attachmentID) {
        return imageSource;
    }

    const isStale = attachment ? attachment?.remoteSource && attachment.remoteSource !== imageSource : false;
    if (isStale) {
        // Only re-cache the [markdown-attachment] if it's outdated
        const cachedUri = await cacheAttachment({attachmentID, source: {uri: imageSource}}).catch(() => {
            throw new Error('[AttachmentCache] Failed to re-cache markdown attachment');
        });
        return cachedUri;
    }

    const localSource = attachment?.source;
    if (localSource) {
        return localSource;
    }

    return imageSource;
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

function init() {
    RNFS.mkdir(ATTACHMENT_DIR).catch(() => {
        console.error('[AttachmentCache] Failed to create attachment directory');
    });
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
