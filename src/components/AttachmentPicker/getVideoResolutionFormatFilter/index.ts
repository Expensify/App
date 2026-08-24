import type GetVideoResolutionFormatFilter from './types';

/**
 * Default (non-native) implementation. The in-app VisionCamera renders only on iOS and Android, so
 * this exists purely so bundlers and typecheck can resolve the import on platforms that never mount
 * the camera. It mirrors the Android behavior of sizing the preview to screen dimensions.
 */
const getVideoResolutionFormatFilter: GetVideoResolutionFormatFilter = (screenWidth, screenHeight) => ({
    videoResolution: {width: screenHeight, height: screenWidth},
});

export default getVideoResolutionFormatFilter;
