import {capturePhotoToPath, captureSnapshotToPath} from '@libs/cameraCapture';
import {rand64} from '@libs/NumberUtils';

import {Platform} from 'react-native';

import type {CaptureReceipt, CaptureReceiptOptions} from './types';

// VisionCamera v5 has no snapshot on iOS.
function shouldTakePhoto({flash, hasFlash, isInLandscapeMode}: Pick<CaptureReceiptOptions, 'flash' | 'hasFlash' | 'isInLandscapeMode'>): boolean {
    return Platform.OS === 'ios' || (flash && hasFlash) || isInLandscapeMode;
}

const captureReceipt: CaptureReceipt = (camera, photoOutput, {flash, hasFlash, isPlatformMuted, isInLandscapeMode, path}) => {
    const filePath = `${path}/receipt_${Date.now()}_${rand64()}.jpg`;

    if (!shouldTakePhoto({flash, hasFlash, isInLandscapeMode})) {
        return captureSnapshotToPath(camera, filePath);
    }

    const isUsingFlash = flash && hasFlash;
    const isSnapshotReplacement = Platform.OS === 'ios' && !isUsingFlash && !isInLandscapeMode;

    return capturePhotoToPath(
        photoOutput,
        {
            flashMode: isUsingFlash ? 'on' : 'off',
            enableShutterSound: isSnapshotReplacement ? false : !isPlatformMuted,
        },
        filePath,
    );
};

export default captureReceipt;
export {shouldTakePhoto};
