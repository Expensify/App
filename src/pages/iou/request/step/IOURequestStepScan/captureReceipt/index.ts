import {capturePhotoToPath, captureSnapshotToPath} from '@libs/cameraCapture';

import type {CaptureReceipt, CaptureReceiptOptions} from './types';

import getReceiptFilePath from './getReceiptFilePath';

/**
 * Whether `captureReceipt` will take a full photo (as opposed to a preview snapshot) for the given options.
 */
function shouldTakePhoto({flash, hasFlash, isInLandscapeMode, isTorchOn = false}: Pick<CaptureReceiptOptions, 'flash' | 'hasFlash' | 'isInLandscapeMode' | 'isTorchOn'>): boolean {
    return (flash && hasFlash && !isTorchOn) || isInLandscapeMode;
}

const captureReceipt: CaptureReceipt = (camera, photoOutput, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode, isTorchOn = false, onWillCapturePhoto}) => {
    const filePath = getReceiptFilePath(path);

    if (!shouldTakePhoto({flash, hasFlash, isInLandscapeMode, isTorchOn})) {
        return captureSnapshotToPath(camera, filePath);
    }

    const isUsingFlash = flash && hasFlash && !isTorchOn;

    return capturePhotoToPath(
        photoOutput,
        {
            flashMode: isUsingFlash ? 'on' : 'off',
            enableShutterSound: !isPlatformMuted,
        },
        filePath,
        {onWillCapturePhoto},
    );
};

export default captureReceipt;
export {shouldTakePhoto};
