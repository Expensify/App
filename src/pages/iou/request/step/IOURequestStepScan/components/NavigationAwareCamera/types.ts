import type {ForwardedRef} from 'react';
import type {CameraRef, CameraViewProps} from 'react-native-vision-camera';
import type {WebcamProps} from 'react-webcam';
import type Webcam from 'react-webcam';

type WebcamScreenshotProps = 'forceScreenshotSourceSize' | 'imageSmoothing' | 'screenshotFormat' | 'screenshotQuality';

type NavigationAwareCameraProps = Omit<WebcamProps, WebcamScreenshotProps> &
    Partial<Pick<WebcamProps, WebcamScreenshotProps>> & {
        ref?: ForwardedRef<Webcam | CameraRef>;
    };

type NavigationAwareCameraNativeProps = Omit<CameraViewProps, 'isActive' | 'ref'> & {
    cameraTabIndex: number;
    ref?: ForwardedRef<CameraRef>;
    forceInactive?: boolean;
};

export type {NavigationAwareCameraProps, NavigationAwareCameraNativeProps};
