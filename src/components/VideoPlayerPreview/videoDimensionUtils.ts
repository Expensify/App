import * as VideoUtils from '@components/VideoPlayer/utils';

import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';

import type {Dimensions} from '@src/types/utils/Layout';

/**
 * Video dimensions measured on web are stored in this module-level cache keyed by the video URL.
 *
 * Uploaded videos are frequently persisted with `data-expensify-width="0"` / `data-expensify-height="0"`, so the real
 * dimensions have to be measured client-side. That measurement lives in local component state, which is lost whenever
 * `VideoPlayerPreview` remounts (editing a message, navigating away via the LHN, refreshing the page). Persisting the
 * measured dimensions here keeps the correct orientation across remounts and avoids a landscape flash while re-measuring.
 */
const measuredVideoDimensionsCache = new Map<string, Dimensions>();

/** A URL points to a local (blob/file) video that does not require an auth token to be probed. */
function isLocalVideoURL(videoUrl: string): boolean {
    return videoUrl.includes('blob:') || videoUrl.includes('file:///');
}

/** Dimensions are only usable when both width and height are finite positive numbers (0/NaN/Infinity are invalid). */
function areVideoDimensionsValid(dimensions: Dimensions | null | undefined): dimensions is Dimensions {
    return (
        !!dimensions &&
        typeof dimensions.width === 'number' &&
        Number.isFinite(dimensions.width) &&
        dimensions.width > 0 &&
        typeof dimensions.height === 'number' &&
        Number.isFinite(dimensions.height) &&
        dimensions.height > 0
    );
}

function getCachedVideoDimensions(videoUrl: string): Dimensions | null {
    return measuredVideoDimensionsCache.get(videoUrl) ?? null;
}

function cacheVideoDimensions(videoUrl: string, dimensions: Dimensions | null | undefined) {
    if (!videoUrl || !areVideoDimensionsValid(dimensions)) {
        return;
    }
    measuredVideoDimensionsCache.set(videoUrl, {width: dimensions.width, height: dimensions.height});
}

/**
 * Build the URL used to probe a video's metadata. Mirrors how `BaseVideoPlayer` sources the same file: local videos are
 * passed through untouched, while server attachments need the `encryptedAuthToken` query param, otherwise the probe's
 * `onloadedmetadata` event never fires for protected attachments.
 */
function getAuthenticatedVideoSourceURL(videoUrl: string, encryptedAuthToken: string): string {
    const authenticatedURL = isLocalVideoURL(videoUrl) ? videoUrl : addEncryptedAuthTokenToURL(videoUrl, encryptedAuthToken);
    return VideoUtils.addSkipTimeTagToURL(authenticatedURL, 0.001);
}

export {areVideoDimensionsValid, cacheVideoDimensions, getAuthenticatedVideoSourceURL, getCachedVideoDimensions, isLocalVideoURL};
