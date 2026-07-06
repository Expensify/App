import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';

import CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';

import * as VideoUtils from '../VideoPlayer/utils';

const measuredVideoDimensionsCache = new Map<string, Dimensions>();

function isVideoDimensionValid(value: number | undefined): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function areVideoDimensionsValid(dimensions: Dimensions | null | undefined): dimensions is Dimensions {
    return isVideoDimensionValid(dimensions?.width) && isVideoDimensionValid(dimensions?.height);
}

function getCachedVideoDimensions(videoUrl: string): Dimensions | null {
    return measuredVideoDimensionsCache.get(videoUrl) ?? null;
}

function cacheVideoDimensions(videoUrl: string, dimensions: Dimensions | null | undefined) {
    if (!videoUrl || !areVideoDimensionsValid(dimensions)) {
        return;
    }

    measuredVideoDimensionsCache.set(videoUrl, dimensions);
}

function clearVideoDimensionsCache() {
    measuredVideoDimensionsCache.clear();
}

function isLocalVideoURL(videoUrl: string): boolean {
    return CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => videoUrl.startsWith(prefix));
}

function getAuthenticatedVideoSourceURL(videoUrl: string, encryptedAuthToken: string): string {
    const authenticatedURL = isLocalVideoURL(videoUrl) ? videoUrl : addEncryptedAuthTokenToURL(videoUrl, encryptedAuthToken);
    return VideoUtils.addSkipTimeTagToURL(authenticatedURL, 0.001);
}

export {areVideoDimensionsValid, cacheVideoDimensions, clearVideoDimensionsCache, getAuthenticatedVideoSourceURL, getCachedVideoDimensions, isLocalVideoURL};
