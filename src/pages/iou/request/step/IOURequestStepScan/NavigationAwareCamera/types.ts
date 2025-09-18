import type {ForwardedRef} from 'react';
import type {Camera, CameraProps, Camera as VisionCamera} from 'react-native-vision-camera';
import type {WebcamProps} from 'react-webcam';
import type Webcam from 'react-webcam';

type NavigationAwareCameraProps = WebcamProps & {
    ref?: ForwardedRef<Webcam | Camera>;
};

type NavigationAwareCameraNativeProps = Omit<CameraProps, 'isActive'> & {
    cameraTabIndex: number;
    ref?: ForwardedRef<VisionCamera>;
};

export type {NavigationAwareCameraProps, NavigationAwareCameraNativeProps};
