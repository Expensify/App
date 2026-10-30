import {capturePhotoToPath, captureSnapshotToPath} from '@libs/cameraCapture';

import type {CaptureReceipt, CaptureReceiptOptions} from './types';

import getReceiptFilePath from './getReceiptFilePath';

/**
 * Whether `captureReceipt` will take a full photo (as opposed to a preview snapshot) for the given options.
 */
function shouldTakePhoto({flash, hasFlash, isInLandscapeMode}: Pick<CaptureReceiptOptions, 'flash' | 'hasFlash' | 'isInLandscapeMode'>): boolean {
    return (flash && hasFlash) || isInLandscapeMode;
}

const captureReceipt: CaptureReceipt = (camera, photoOutput, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode, onWillCapturePhoto}) => {
    const filePath = getReceiptFilePath(path);

    if (!shouldTakePhoto({flash, hasFlash, isInLandscapeMode})) {
        return captureSnapshotToPath(camera, filePath);
    }

    const isUsingFlash = flash && hasFlash;

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
