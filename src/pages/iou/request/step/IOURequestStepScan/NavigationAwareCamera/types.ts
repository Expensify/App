import type {CameraDevice} from 'react-native-vision-camera';

type NavigationAwareCameraProps = {
    /** Flag to turn on/off the torch/flashlight - if available */
    torchOn: boolean;

    /** The index of the tab that contains this camera */
    onTorchAvailability?: (torchAvailable: boolean) => void;

    /** Callback function when media stream becomes available - user granted camera permissions and camera starts to work */
    cameraTabIndex: number;

    /** Callback function passing torch/flashlight capability as bool param of the browser */
    onUserMedia?: (stream: MediaStream) => void;
};

type NavigationAwareCameraNativeProps = {
    cameraTabIndex: number;
    device: CameraDevice;
};

export type {NavigationAwareCameraProps, NavigationAwareCameraNativeProps};
