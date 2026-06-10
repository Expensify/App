import type {CaptureReceipt} from './types';

const captureReceipt: CaptureReceipt = (camera, {flash, hasFlash, isPlatformMuted, path, isInLandscapeMode}) => {
    const useFlash = flash && hasFlash;
    if (useFlash || isInLandscapeMode) {
        return camera.takePhoto({
            flash: useFlash ? 'on' : 'off',
            enableShutterSound: !isPlatformMuted,
            path,
        });
    }

    return camera.takeSnapshot({quality: 85, path});
};

export default captureReceipt;
