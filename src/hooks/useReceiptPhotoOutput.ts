/**
 * JPEG photo output for receipt captures, with the viewfinder aspect ratio of the photo it will save.
 *
 * v5 negotiates the photo size, which is only known from `currentResolution` once configured; on Android it can come
 * out 16:9 despite a 4:3 target.
 *
 * The output must be owned by the component that renders the camera: an output shared between sessions aborts
 * (VisionCamera #4156).
 */
import getCameraAspectRatio from '@libs/cameraCapture/getCameraAspectRatio';

import CONST from '@src/CONST';

import type {QualityPrioritization, Size} from 'react-native-vision-camera';

import {useState} from 'react';
import {usePhotoOutput} from 'react-native-vision-camera';

const PHOTO_TARGET_RESOLUTION = {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT};

function useReceiptPhotoOutput(qualityPrioritization: QualityPrioritization, isInLandscapeMode: boolean) {
    // v5's default 'native' container is HEIC on iOS.
    const photoOutput = usePhotoOutput({targetResolution: PHOTO_TARGET_RESOLUTION, containerFormat: 'jpeg', qualityPrioritization});
    const [photoResolution, setPhotoResolution] = useState<Size | undefined>(undefined);

    const updatePhotoResolution = () => {
        const resolution = photoOutput.currentResolution;
        // iOS reports 0x0 until the output is configured.
        if (!resolution?.width || !resolution.height) {
            return;
        }
        setPhotoResolution((previous) => (previous?.width === resolution.width && previous?.height === resolution.height ? previous : {width: resolution.width, height: resolution.height}));
    };

    return {photoOutput, cameraAspectRatio: getCameraAspectRatio(photoResolution ?? PHOTO_TARGET_RESOLUTION, isInLandscapeMode), updatePhotoResolution};
}

export default useReceiptPhotoOutput;
