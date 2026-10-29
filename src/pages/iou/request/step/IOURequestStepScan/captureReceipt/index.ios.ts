import {capturePhotoToPath} from '@libs/cameraCapture';

import type {CaptureReceipt} from './types';

import getReceiptFilePath from './getReceiptFilePath';

// VisionCamera v5 has no snapshot on iOS.
function shouldTakePhoto(): boolean {
    return true;
}

const captureReceipt: CaptureReceipt = (camera, photoOutput, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode, onWillCapturePhoto}) => {
    const filePath = getReceiptFilePath(path);
    const isUsingFlash = flash && hasFlash;
    // A plain portrait scan stands in for the silent v4 snapshot.
    const isSnapshotReplacement = !isUsingFlash && !isInLandscapeMode;

    return capturePhotoToPath(
        photoOutput,
        {
            flashMode: isUsingFlash ? 'on' : 'off',
            enableShutterSound: isSnapshotReplacement ? false : !isPlatformMuted,
        },
        filePath,
        {onWillCapturePhoto},
    );
};

export default captureReceipt;
export {shouldTakePhoto};
