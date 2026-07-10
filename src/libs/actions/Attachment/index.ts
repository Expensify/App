import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

const attachmentLocalSources = new Map<string, string>();

function getAttachmentLocalSource(attachmentID: string | undefined): string | undefined {
    if (!attachmentID) {
        return undefined;
    }
    return attachmentLocalSources.get(attachmentID);
}

async function fetchExternalAttachment(source: string): Promise<string> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => {
            reject(new Error(`Failed to load image: ${source}`));
        };
        image.src = source;
    });

    await img.decode();

    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        throw new Error('Image has zero dimensions');
    }

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))));
    });

    return URL.createObjectURL(blob);
}

async function cacheAttachment({uri, attachmentID, authToken}: CacheAttachmentProps): Promise<string | undefined> {
    if (!uri) {
        return;
    }

    const isAuthRemoteAttachment = authToken && !attachmentID;
    const isMarkdownAttachment = !authToken && !isLocalFile(uri);

    // If both are empty, then return early
    if (!isAuthRemoteAttachment && !attachmentID) {
        return;
    }

    const cacheKey = !isAuthRemoteAttachment && attachmentID ? attachmentID : uri;

    if (attachmentID) {
        const existingSource = attachmentLocalSources.get(attachmentID);
        if (existingSource) {
            return existingSource;
        }
    }

    // Save local URI immediately for uploads so it can be rendered while caching is in progress
    if (attachmentID && isLocalFile(uri)) {
        attachmentLocalSources.set(attachmentID, uri);
    }

    return (async () => {
        try {
            // For markdown images, fetch via canvas to bypass CORS and get a blob URL
            const fetchSource = isMarkdownAttachment ? await fetchExternalAttachment(uri) : uri;

            const response = await fetch(fetchSource, authToken ? {headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken}} : {});

            if (isMarkdownAttachment) {
                URL.revokeObjectURL(fetchSource);
            }

            if (!response.ok) {
                throw new Error('[AttachmentCache] Failed to fetch attachment');
            }

            const contentType = response.headers.get('content-type') ?? '';
            if (contentType === 'image/heic') {
                throw new Error('[AttachmentCache] HEIC is not supported, skipping cache');
            }

            const fileExtension = getImageCacheFileExtension(contentType);
            if (!fileExtension) {
                throw new Error('[AttachmentCache] Unsupported file type, skipping cache');
            }

            await CacheAPI.put(isAuthRemoteAttachment ? CONST.CACHE_NAME.AUTH_IMAGES : CONST.CACHE_NAME.ATTACHMENTS, cacheKey, response.clone());
            await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                remoteSource: isMarkdownAttachment ? uri : undefined,
            });

            const cachedSource = URL.createObjectURL(await response.blob());

            // Update local source to the cached blob URL
            if (attachmentID) {
                attachmentLocalSources.set(attachmentID, cachedSource);
            }

            return cachedSource;
        } catch (error) {
            // Clean up local source reference on failure
            if (attachmentID) {
                attachmentLocalSources.delete(attachmentID);
            }

            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                await clearCachedAttachments();
            }
            throw new Error('[AttachmentCache] Failed to cache attachment');
        }
    })();
}

async function getCachedAttachment({uri, attachmentID, remoteSource, authToken}: GetCachedAttachmentProps): Promise<string | undefined> {
    if (!uri) {
        return;
    }

    const isAuthRemoteAttachment = authToken && !attachmentID;
    const isMarkdownAttachment = !authToken && !isLocalFile(uri);

    if (attachmentID) {
        const localUri = attachmentLocalSources.get(attachmentID);
        if (localUri) {
            return localUri;
        }
    }

    // For markdown attachments, check if the cached source is stale and re-cache if needed
    if (isMarkdownAttachment && remoteSource) {
        if (remoteSource !== uri) {
            const cachedUri = await cacheAttachment({uri, attachmentID});
            return cachedUri;
        }
    }

    const cacheKey = !isAuthRemoteAttachment && attachmentID ? attachmentID : uri;
    const cacheName = isAuthRemoteAttachment ? CONST.CACHE_NAME.AUTH_IMAGES : CONST.CACHE_NAME.ATTACHMENTS;
    if (!cacheKey) {
        return;
    }

    const cachedAttachment = await CacheAPI.get(cacheName, cacheKey);
    if (!cachedAttachment) {
        const shouldCacheAttachment = !uri.startsWith('blob:');
        if (shouldCacheAttachment) {
            const cachedUri = await cacheAttachment({uri, attachmentID, authToken});
            return cachedUri;
        }
        return;
    }

    const attachmentFile = await cachedAttachment.blob();
    const cachedSource = URL.createObjectURL(attachmentFile);

    if (attachmentID) {
        attachmentLocalSources.set(attachmentID, cachedSource);
    }

    return cachedSource;
}

async function removeCachedAttachment({attachmentID}: RemoveCachedAttachmentProps) {
    try {
        await CacheAPI.remove(CONST.CACHE_NAME.ATTACHMENTS, attachmentID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
        attachmentLocalSources.delete(attachmentID);
    } catch (error) {
        Log.hmmm(`[AttachmentCache] Failed to remove cached attachment: ${attachmentID}`, {message: (error as Error).message});
    }
}

async function clearCachedAttachments() {
    try {
        await Promise.all([CacheAPI.clear(CONST.CACHE_NAME.AUTH_IMAGES), CacheAPI.clear(CONST.CACHE_NAME.ATTACHMENTS)]);
        await Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
        attachmentLocalSources.clear();
    } catch (error) {
        Log.hmmm('[AttachmentCache] Failed to clear cached attachments', {message: (error as Error).message});
    }
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments, getAttachmentLocalSource};
