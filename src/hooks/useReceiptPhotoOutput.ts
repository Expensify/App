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

// Receipt enhancement draws the outline from the detection frames over the preview. With the ~5 MP format the preview
// shows a narrower view than the frames (~1.41x on the iPhone 14 Pro's main lens), so the outline wouldn't line up with
// the receipt. The full-sensor format gives both the same view.
const FULL_SENSOR_PHOTO_TARGET_RESOLUTION = {width: 4032, height: 3024};

function useReceiptPhotoOutput(qualityPrioritization: QualityPrioritization, isInLandscapeMode: boolean, shouldUseFullSensorResolution = false) {
    const targetResolution = shouldUseFullSensorResolution ? FULL_SENSOR_PHOTO_TARGET_RESOLUTION : PHOTO_TARGET_RESOLUTION;
    // v5's default 'native' container is HEIC on iOS.
    const photoOutput = usePhotoOutput({targetResolution, containerFormat: 'jpeg', qualityPrioritization});
    const [photoResolution, setPhotoResolution] = useState<Size | undefined>(undefined);

    const updatePhotoResolution = () => {
        const resolution = photoOutput.currentResolution;
        // iOS reports 0x0 until the output is configured.
        if (!resolution?.width || !resolution.height) {
            return;
        }
        setPhotoResolution((previous) => (previous?.width === resolution.width && previous?.height === resolution.height ? previous : {width: resolution.width, height: resolution.height}));
    };

    return {photoOutput, cameraAspectRatio: getCameraAspectRatio(photoResolution ?? targetResolution, isInLandscapeMode), updatePhotoResolution};
}

export default useReceiptPhotoOutput;
