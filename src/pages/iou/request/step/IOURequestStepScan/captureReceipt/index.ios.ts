import type {CaptureReceipt} from './types';

const captureReceipt: CaptureReceipt = (camera, {flash, hasFlash, isPlatformMuted, path}) => {
    return camera.takePhoto({
        flash: flash && hasFlash ? 'on' : 'off',
        enableShutterSound: !isPlatformMuted,
        path,
    });
};

export default captureReceipt;
