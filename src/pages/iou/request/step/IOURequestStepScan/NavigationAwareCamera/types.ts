import type {CameraProps} from 'react-native-vision-camera';
import type {WebcamProps} from 'react-webcam';

type NavigationAwareCameraProps = WebcamProps & {
    /** Flag to turn on/off the torch/flashlight - if available */
    torchOn?: boolean;

    /** The index of the tab that contains this camera */
    onTorchAvailability?: (torchAvailable: boolean) => void;

    /** Callback function when media stream becomes available - user granted camera permissions and camera starts to work */
    cameraTabIndex: number;
};

type NavigationAwareCameraNativeProps = Omit<CameraProps, 'isActive'> & {
    cameraTabIndex: number;
};

export type {NavigationAwareCameraProps, NavigationAwareCameraNativeProps};
