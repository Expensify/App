import type {FormatFilter} from 'react-native-vision-camera';

/**
 * Builds the videoResolution filter for the in-app camera. The live viewfinder renders from the video
 * pipeline, so this controls preview quality only. Capture always uses the photo resolution.
 */
type GetVideoResolutionFormatFilter = (windowWidth: number, windowHeight: number) => FormatFilter;

export default GetVideoResolutionFormatFilter;
