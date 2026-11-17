import type {getSize} from 'react-native-image-size';

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
};

type GetDeviceOrientationAwareImageSize = (params: GetDeviceOrientationAwareImageSizeParams) => DeviceOrientationAwareImageSize;

// eslint-disable-next-line import/prefer-default-export
export type {GetDeviceOrientationAwareImageSize};
