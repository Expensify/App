import type {Camera, PhotoFile} from 'react-native-vision-camera';

type CaptureReceiptOptions = {
    flash: boolean;
    hasFlash: boolean;
    isPlatformMuted: boolean | undefined;
    path: string;
    isInLandscapeMode: boolean;
};

type CaptureReceipt = (camera: Camera, options: CaptureReceiptOptions) => Promise<PhotoFile>;

export type {CaptureReceipt, CaptureReceiptOptions};
