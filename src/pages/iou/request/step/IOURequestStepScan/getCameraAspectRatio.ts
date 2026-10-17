import type {Size} from 'react-native-vision-camera';

/** Viewfinder aspect ratio for a photo of the given sensor-oriented (landscape) size. */
function getCameraAspectRatio(photoSize: Size | undefined, isInLandscapeMode: boolean): number | undefined {
    if (!photoSize) {
        return undefined;
    }
    if (isInLandscapeMode) {
        return photoSize.width / photoSize.height;
    }

    return photoSize.height / photoSize.width;
}

export default getCameraAspectRatio;
