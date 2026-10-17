import getCameraAspectRatio from '@pages/iou/request/step/IOURequestStepScan/getCameraAspectRatio';

import type {CameraPhotoOutput, Size} from 'react-native-vision-camera';

import {useState} from 'react';

/**
 * Viewfinder aspect ratio of the photo the camera saves. v5 negotiates the photo size, which is only known from
 * `currentResolution` once configured; on Android it can come out 16:9 despite a 4:3 target.
 */
function useCameraPhotoAspectRatio(photoOutput: CameraPhotoOutput, targetResolution: Size, isInLandscapeMode: boolean) {
    const [photoResolution, setPhotoResolution] = useState<Size | undefined>(undefined);

    const updatePhotoResolution = () => {
        const resolution = photoOutput.currentResolution;
        // iOS can report 0x0 before the output is connected.
        if (!resolution || resolution.width <= 0 || resolution.height <= 0) {
            return;
        }
        setPhotoResolution((previous) => (previous?.width === resolution.width && previous?.height === resolution.height ? previous : {width: resolution.width, height: resolution.height}));
    };

    return {cameraAspectRatio: getCameraAspectRatio(photoResolution ?? targetResolution, isInLandscapeMode), updatePhotoResolution};
}

export default useCameraPhotoAspectRatio;
