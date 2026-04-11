import CONST from '@src/CONST';

/**
 * Returns image cache file extension based from mime type
 */
function getImageCacheFileExtension(contentType: string) {
    const imageCacheFileTypes: Record<string, string> = CONST.IMAGE_CACHE_FILE_TYPES;
    return imageCacheFileTypes[contentType] ?? '';
}

// eslint-disable-next-line import/prefer-default-export
export {getImageCacheFileExtension};
