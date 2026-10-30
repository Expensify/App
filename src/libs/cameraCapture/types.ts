import type {CameraOrientation} from 'react-native-vision-camera';

/** A captured image written to disk. */
type CapturedPhoto = {
    path: string;
    width: number;
    height: number;
    orientation?: CameraOrientation;
};

export default CapturedPhoto;
