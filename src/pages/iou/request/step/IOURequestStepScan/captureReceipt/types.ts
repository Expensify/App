import type CapturedPhoto from '@libs/cameraCapture/types';

import type {CameraPhotoOutput, CameraRef} from 'react-native-vision-camera';

type CaptureReceiptOptions = {
    flash: boolean;
    hasFlash: boolean;
    isPlatformMuted: boolean | undefined;
    isInLandscapeMode: boolean;
    path: string;
};

type CaptureReceipt = (camera: CameraRef, photoOutput: CameraPhotoOutput, options: CaptureReceiptOptions) => Promise<CapturedPhoto>;

export type {CaptureReceipt, CaptureReceiptOptions};
