import type {CameraDevice, CameraDeviceFormat} from 'react-native-vision-camera';

type PreferPhaseDetectionFormatParams = {
    device: Pick<CameraDevice, 'formats'> | undefined;
    format: CameraDeviceFormat | undefined;
};

type PreferPhaseDetectionFormat = (params: PreferPhaseDetectionFormatParams) => CameraDeviceFormat | undefined;

export default PreferPhaseDetectionFormat;
