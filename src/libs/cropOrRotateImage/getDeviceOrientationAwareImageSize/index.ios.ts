import type {GetDeviceOrientationAwareImageSize} from './types';

const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, aspectRatioWidth, aspectRatioHeight}) => {
    return {
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        aspectRatioWidth,
        aspectRatioHeight,
    };
};

export default getDeviceOrientationAwareImageSize;
