import type {CameraProps} from 'react-native-vision-camera';
import type {WebcamProps} from 'react-webcam';

type NavigationAwareCameraProps = WebcamProps;

type NavigationAwareCameraNativeProps = Omit<CameraProps, 'isActive'> & {
    cameraTabIndex: number;
};

export type {NavigationAwareCameraProps, NavigationAwareCameraNativeProps};
