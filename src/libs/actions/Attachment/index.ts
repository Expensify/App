import Onyx from 'react-native-onyx';
import image from '@components/Image';
import {getImageCacheFileExtension} from '@libs/AttachmentUtils';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

const pendingCaches = new Map<string, Promise<string | undefined>>();

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

async function cacheAttachment({uri, attachmentID, sourceHeaders}: CacheAttachmentProps): Promise<string | undefined> {
    let imageSource = uri;
    if (!imageSource) {
        return;
    }

    const isAuthRemoteAttachment = !isEmptyObject(sourceHeaders) && !attachmentID;
    const isMarkdownAttachment = isEmptyObject(sourceHeaders) && !isLocalFile(imageSource);

    // If both are empty, then return early
    if (!isAuthRemoteAttachment && !attachmentID) {
        return;
    }

    const cacheKey = !isAuthRemoteAttachment && attachmentID ? attachmentID : uri;

    // If this current URL is already being cached, return the existing promise
    const existingPromise = pendingCaches.get(cacheKey);
    if (existingPromise) {
        return existingPromise;
    }

    const cachingPromise = (async () => {
        try {
            if (isMarkdownAttachment) {
                imageSource = await fetchExternalAttachment(uri);
            }

            const response = await fetch(imageSource, !isEmptyObject(sourceHeaders) ? {headers: sourceHeaders} : {});

            if (isMarkdownAttachment) {
                URL.revokeObjectURL(imageSource);
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

            const cachedAttachment = response.clone();

            await CacheAPI.put(isAuthRemoteAttachment ? CONST.CACHE_NAME.AUTH_IMAGES : CONST.CACHE_NAME.ATTACHMENTS, cacheKey, cachedAttachment);
            await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                remoteSource: isMarkdownAttachment ? uri : undefined,
            });

            const cachedBlob = await response.blob();
            const cachedSource = URL.createObjectURL(cachedBlob);

            return cachedSource;
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                await clearCachedAttachments();
            }
            throw new Error('[AttachmentCache] Failed to cache attachment');
        } finally {
            pendingCaches.delete(cacheKey);
        }
    })();

    // Store the promise so concurrent callers can await it
    pendingCaches.set(cacheKey, cachingPromise);

    return cachingPromise;
}

async function getCachedAttachment({uri, attachmentID, attachment, sourceHeaders}: GetCachedAttachmentProps): Promise<string | undefined> {
    if (!uri) {
        return;
    }

    const imageSource = uri;
    const isAuthRemoteAttachment = !isEmptyObject(sourceHeaders) && !attachmentID;
    const isMarkdownAttachment = isEmptyObject(sourceHeaders) && !isLocalFile(imageSource);

    // If this URL is currently being cached, wait for it to finish
    const cacheKey = !isAuthRemoteAttachment && attachmentID ? attachmentID : imageSource;
    const cachePromise = pendingCaches.get(cacheKey);
    if (cachePromise) {
        return cachePromise.catch(() => imageSource);
    }

    // For markdown attachments, check if the cached source is stale and re-cache if needed
    if (isMarkdownAttachment && attachment?.remoteSource) {
        const isStale = attachment.remoteSource !== imageSource;
        if (isStale) {
            const cachedUri = await cacheAttachment({uri: imageSource, attachmentID}).catch((error) => {
                Log.hmmm('[AttachmentCache] Failed to re-cache markdown attachment', {message: (error as Error).message});
                return undefined;
            });
            return cachedUri;
        }
    }

    const cacheName = isAuthRemoteAttachment ? CONST.CACHE_NAME.AUTH_IMAGES : CONST.CACHE_NAME.ATTACHMENTS;
    if (!cacheKey) {
        return;
    }
    const cachedAttachment = await CacheAPI.get(cacheName, cacheKey);
    const isUncached = !cachedAttachment;
    if (isUncached) {
        const cachedUri = await cacheAttachment({uri, attachmentID, sourceHeaders});
        return cachedUri;
    }

    const attachmentFile = await cachedAttachment.blob();
    return URL.createObjectURL(attachmentFile);
}

async function removeCachedAttachment({attachmentID}: RemoveCachedAttachmentProps) {
    try {
        await CacheAPI.remove(CONST.CACHE_NAME.ATTACHMENTS, attachmentID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
    } catch (error) {
        Log.hmmm(`[AttachmentCache] Failed to remove cached attachment: ${attachmentID}`, {message: (error as Error).message});
    }
}

async function clearCachedAttachments() {
    try {
        await Promise.all([CacheAPI.clear(CONST.CACHE_NAME.AUTH_IMAGES), CacheAPI.clear(CONST.CACHE_NAME.ATTACHMENTS)]);
        await Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
    } catch (error) {
        Log.hmmm('[AttachmentCache] Failed to clear cached attachments', {message: (error as Error).message});
    }
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
