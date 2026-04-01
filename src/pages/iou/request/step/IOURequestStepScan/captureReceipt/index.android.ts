import type {CaptureReceipt} from './types';

const captureReceipt: CaptureReceipt = (camera, {flash, hasFlash, isPlatformMuted, path}) => {
    const useFlash = flash && hasFlash;
    if (useFlash) {
        return camera.takePhoto({
            flash: 'on',
            enableShutterSound: !isPlatformMuted,
            path,
        });
    }

    return camera.takeSnapshot({quality: 85, path});
};

export default captureReceipt;
