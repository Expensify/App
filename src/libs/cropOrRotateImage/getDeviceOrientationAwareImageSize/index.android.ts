import type {GetDeviceOrientationAwareImageSize} from './types';

/**
 * Native does NOT automatically handle image rotation based on device orientation
 * On Android, react-native-image-size already returns the rotation of the image
 */
const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, aspectRatioWidth, aspectRatioHeight}) => {
    const {width, height, rotation} = imageSize;
    const isRotated = rotation === 0 || rotation === 180;
    return {
        imageWidth: !isRotated ? height : width,
        imageHeight: !isRotated ? width : height,
        aspectRatioWidth,
        aspectRatioHeight,
    };
};

export default getDeviceOrientationAwareImageSize;
