import type GetVideoResolutionFormatFilter from './types';

/**
 * On Android, keep the preview resolution at screen dimensions to avoid allocating a
 * higher-than-needed preview surface and burning GPU. Format dimensions are landscape, so the
 * screen width and height are swapped.
 */
const getVideoResolutionFormatFilter: GetVideoResolutionFormatFilter = (screenWidth, screenHeight) => ({
    videoResolution: {width: screenHeight, height: screenWidth},
});

export default getVideoResolutionFormatFilter;
