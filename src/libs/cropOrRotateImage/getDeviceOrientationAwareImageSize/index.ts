import type {GetDeviceOrientationAwareImageSize} from './types';

/**
 * Web automatically rotates images based on device orientation
 */
const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, aspectRatioWidth, aspectRatioHeight}) => ({
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    aspectRatioWidth,
    aspectRatioHeight,
});

export default getDeviceOrientationAwareImageSize;
