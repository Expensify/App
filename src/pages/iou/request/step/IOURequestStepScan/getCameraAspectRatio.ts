import type {CameraDeviceFormat} from 'react-native-vision-camera';

function getCameraAspectRatio(format: CameraDeviceFormat | undefined, isInLandscapeMode: boolean): number | undefined {
    if (!format) {
        return undefined;
    }
    if (isInLandscapeMode) {
        return format.photoWidth / format.photoHeight;
    }

    return format.photoHeight / format.photoWidth;
}

export default getCameraAspectRatio;
