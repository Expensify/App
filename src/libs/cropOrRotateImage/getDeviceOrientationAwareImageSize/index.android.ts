import type {GetDeviceOrientationAwareImageSize} from './types';

/**
 * Native does NOT automatically handle image rotation based on device orientation
 * On Android, react-native-image-size already returns the rotation of the image
 */
const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, aspectRatioWidth, aspectRatioHeight}) => {
    const {width, height, rotation} = imageSize;
    const isRotated = rotation === 90 || rotation === 270;
    return {
        imageWidth: isRotated ? height : width,
        imageHeight: isRotated ? width : height,
        aspectRatioWidth: isRotated ? aspectRatioWidth : aspectRatioHeight,
        aspectRatioHeight: isRotated ? aspectRatioHeight : aspectRatioWidth,
    };
};

export default getDeviceOrientationAwareImageSize;
