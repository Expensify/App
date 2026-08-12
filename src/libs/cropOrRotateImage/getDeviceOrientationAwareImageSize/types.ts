import type {getSize} from 'react-native-image-size';
import type {Orientation} from 'react-native-vision-camera';

type DeviceOrientationAwareImageSize = {
    imageWidth: number;
    imageHeight: number;
    aspectRatioWidth?: number;
    aspectRatioHeight?: number;
};

type GetDeviceOrientationAwareImageSizeParams = {
    imageSize: Awaited<ReturnType<typeof getSize>>;
    aspectRatioWidth?: number;
    aspectRatioHeight?: number;
    orientation?: Orientation;
};

type GetDeviceOrientationAwareImageSize = (params: GetDeviceOrientationAwareImageSizeParams) => DeviceOrientationAwareImageSize;

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {GetDeviceOrientationAwareImageSize};
