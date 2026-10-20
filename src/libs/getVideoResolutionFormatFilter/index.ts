import type GetVideoResolutionFormatFilter from './types';

// The in-app camera only mounts on iOS and Android. This default exists so the import resolves on
// other platforms, and it mirrors the Android sizing.
const getVideoResolutionFormatFilter: GetVideoResolutionFormatFilter = (windowWidth, windowHeight) => ({
    videoResolution: {width: windowHeight, height: windowWidth},
});

export default getVideoResolutionFormatFilter;
