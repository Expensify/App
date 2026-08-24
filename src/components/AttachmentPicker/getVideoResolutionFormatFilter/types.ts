import type {FormatFilter} from 'react-native-vision-camera';

/**
 * Builds the videoResolution format filter for the in-app camera preview. The live viewfinder
 * renders from the video pipeline, so this controls preview quality; capture always uses the
 * photo resolution via takePhoto. Screen dimensions are passed in so platform helpers can size
 * the preview surface without reading window state themselves.
 */
type GetVideoResolutionFormatFilter = (screenWidth: number, screenHeight: number) => FormatFilter;

export default GetVideoResolutionFormatFilter;
