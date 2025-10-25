import type {GetDeviceOrientationAwareImageSize} from './types';

/**
 * Native does NOT automatically handles image rotation based on device orientation
 * On iOS, react-native-image-size uses RN `Image.getSize` API internally which only provides width and height
 * So we need react-native-vision-camera `orientation` to know if the image is rotated
 */
const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, orientation, aspectRatioWidth, aspectRatioHeight}) => {
    const isRotated = orientation === 'portrait' || orientation === 'portrait-upside-down';
    return {
        imageWidth: imageSize.width,
        imageHeight: imageSize.height,
        isRotated,
        aspectRatioWidth: isRotated ? aspectRatioHeight : aspectRatioWidth,
        aspectRatioHeight: isRotated ? aspectRatioWidth : aspectRatioHeight,
    };
};

export default getDeviceOrientationAwareImageSize;
