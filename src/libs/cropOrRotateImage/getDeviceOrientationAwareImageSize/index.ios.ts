import type {GetDeviceOrientationAwareImageSize} from './types';

/**
 * Native does NOT automatically handles image rotation based on device orientation
 * On iOS, react-native-image-size uses RN `Image.getSize` API internally which only provides width and height
 * So we need react-native-vision-camera `orientation` to know if the image is rotated
 */
const getDeviceOrientationAwareImageSize: GetDeviceOrientationAwareImageSize = ({imageSize, orientation, aspectRatioWidth, aspectRatioHeight}) => {
    const {width, height} = imageSize;
    const isRotated = orientation === 'landscape-left' || orientation === 'landscape-right';
    return {
        imageWidth: isRotated ? height : width,
        imageHeight: isRotated ? width : height,
        isRotated,
        aspectRatioWidth: isRotated ? aspectRatioWidth : aspectRatioHeight,
        aspectRatioHeight: isRotated ? aspectRatioHeight : aspectRatioWidth,
    };
};

export default getDeviceOrientationAwareImageSize;
