import type {CaptureReceipt, CaptureReceiptOptions} from './types';

/**
 * Whether `captureReceipt` will use `takePhoto` (as opposed to `takeSnapshot`) for the given options.
 */
function shouldTakePhoto({flash, hasFlash, isInLandscapeMode}: Pick<CaptureReceiptOptions, 'flash' | 'hasFlash' | 'isInLandscapeMode'>): boolean {
    return (flash && hasFlash) || isInLandscapeMode;
}

const captureReceipt: CaptureReceipt = (camera, options) => {
    const {flash, hasFlash, isPlatformMuted, path} = options;
    if (shouldTakePhoto(options)) {
        return camera.takePhoto({
            flash: flash && hasFlash ? 'on' : 'off',
            enableShutterSound: !isPlatformMuted,
            path,
        });
    }

    return camera.takeSnapshot({quality: 85, path});
};

export default captureReceipt;
export {shouldTakePhoto};
