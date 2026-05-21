import CONST from '@src/CONST';

/**
 * Returns image cache file extension based from mime type
 */
function getImageCacheFileExtension(contentType: string) {
    const imageCacheFileTypes: Record<string, string> = CONST.IMAGE_CACHE_FILE_TYPES;
    return imageCacheFileTypes[contentType] ?? '';
}

function isLocalAttachmentSource(source: string) {
    return CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => source.startsWith(prefix));
}

export {getImageCacheFileExtension, isLocalAttachmentSource};
