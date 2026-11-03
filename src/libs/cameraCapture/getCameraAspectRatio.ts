import type {Size} from 'react-native-vision-camera';

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
