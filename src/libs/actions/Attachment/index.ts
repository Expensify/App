import Onyx from 'react-native-onyx';
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

async function cacheAttachment({attachmentID, source}: CacheAttachmentProps): Promise<string | undefined> {
    let uri = source.uri;
    if (!uri) {
        return;
    }

    const isAuthRemoteAttachment = !isEmptyObject(source.headers) && !attachmentID;
    const isMarkdownAttachment = isEmptyObject(source.headers) && !isLocalFile(source.uri);

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
                uri = await fetchExternalAttachment(uri);
            }

            const response = await fetch(uri, !isEmptyObject(source.headers) ? {headers: source.headers} : {});
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
            if (isAuthRemoteAttachment) {
                await Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                    attachmentID,
                    remoteSource: isMarkdownAttachment ? source.uri : undefined,
                });
            }

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

async function getCachedAttachment({attachmentID, attachment, source}: GetCachedAttachmentProps): Promise<string | undefined> {
    if (isEmptyObject(source) || !source.uri) {
        return;
    }

    const imageSource = source.uri;

    // If this URL is currently being cached, wait for it to finish
    const cachePromise = pendingCaches.get(imageSource);
    if (cachePromise) {
        console.log('caching is in progress');
        return cachePromise.catch(() => imageSource);
    }

    const isAuthRemoteAttachment = !isEmptyObject(source.headers) && !attachmentID;
    const isMarkdownAttachment = isEmptyObject(source.headers) && !isLocalFile(imageSource);
    // For markdown attachments, check if the cached source is stale and re-cache if needed
    if (isMarkdownAttachment && attachment?.remoteSource) {
        const isStale = attachment.remoteSource !== imageSource;
        if (isStale) {
            const cachedUri = await cacheAttachment({attachmentID, source: {uri: imageSource}}).catch((error) => {
                Log.hmmm('[AttachmentCache] Failed to re-cache markdown attachment', {message: (error as Error).message});
            });
            return cachedUri ? cachedUri : undefined;
        }
    }

    const cacheName = isAuthRemoteAttachment ? CONST.CACHE_NAME.AUTH_IMAGES : CONST.CACHE_NAME.ATTACHMENTS;
    const cacheKey = isAuthRemoteAttachment ? imageSource : attachmentID;
    if (!cacheKey) {
        return;
    }
    const cachedAttachment = await CacheAPI.get(cacheName, cacheKey);
    const isUncached = !cachedAttachment;
    if (isUncached) {
        const cachedUri = await cacheAttachment({attachmentID, source});
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
