import type {GetDeviceOrientationAwareImageSize} from './types';

/**
 * On web and iOS the reported image size is already corrected for the device orientation
 */
const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, aspectRatioWidth, aspectRatioHeight}) => ({
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    aspectRatioWidth,
    aspectRatioHeight,
});

export default getDeviceOrientationAwareImageSize;
