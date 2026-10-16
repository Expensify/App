import type GetVideoResolutionFormatFilter from './types';

// Size the preview to the screen to avoid an oversized preview surface. Format dimensions are
// landscape, so the window dimensions are swapped.
const getVideoResolutionFormatFilter: GetVideoResolutionFormatFilter = (windowWidth, windowHeight) => ({
    videoResolution: {width: windowHeight, height: windowWidth},
});

export default getVideoResolutionFormatFilter;
