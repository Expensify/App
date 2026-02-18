import type {getSize} from 'react-native-image-size';
import type {Orientation} from 'react-native-vision-camera';
import getDeviceOrientationAwareImageSizeWeb from '../../src/libs/cropOrRotateImage/getDeviceOrientationAwareImageSize/index';
import getDeviceOrientationAwareImageSizeAndroid from '../../src/libs/cropOrRotateImage/getDeviceOrientationAwareImageSize/index.android';
import getDeviceOrientationAwareImageSizeIOS from '../../src/libs/cropOrRotateImage/getDeviceOrientationAwareImageSize/index.ios';

type GetDeviceOrientationAwareImageSizeParams = {
    imageSize: Awaited<ReturnType<typeof getSize>>;
    aspectRatioWidth?: number;
    aspectRatioHeight?: number;
    orientation?: Orientation;
};

const mockImageSize = {
    width: 1920,
    height: 1080,
};

const mockImageSizeWithRotation = {
    width: 1920,
    height: 1080,
    rotation: 0,
};

describe('getDeviceOrientationAwareImageSize', () => {
    describe('Web Platform', () => {
        it('should return original dimensions with no rotation', () => {
            const params: GetDeviceOrientationAwareImageSizeParams = {
                imageSize: mockImageSize,
                aspectRatioWidth: 16,
                aspectRatioHeight: 9,
            };
            const result = getDeviceOrientationAwareImageSizeWeb(params);
            expect(result).toEqual({
                imageWidth: 1920,
                imageHeight: 1080,
                aspectRatioWidth: 16,
                aspectRatioHeight: 9,
            });
        });
    });

    describe('iOS Platform', () => {
        describe('Portrait orientations (rotated)', () => {
            it('should detect rotation for portrait orientation', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: mockImageSize,
                    orientation: 'portrait',
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeIOS(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 9,
                    aspectRatioHeight: 16,
                });
            });

            it('should detect rotation for portrait-upside-down orientation', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: mockImageSize,
                    orientation: 'portrait-upside-down',
                    aspectRatioWidth: 4,
                    aspectRatioHeight: 3,
                };
                const result = getDeviceOrientationAwareImageSizeIOS(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 3,
                    aspectRatioHeight: 4,
                });
            });
        });

        describe('Landscape orientations (not rotated)', () => {
            it('should not detect rotation for landscape-left orientation', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: mockImageSize,
                    orientation: 'landscape-left',
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeIOS(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                });
            });

            it('should not detect rotation for landscape-right orientation', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: mockImageSize,
                    orientation: 'landscape-right',
                    aspectRatioWidth: 21,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeIOS(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 21,
                    aspectRatioHeight: 9,
                });
            });
        });
    });

    describe('Android Platform', () => {
        describe('Non-rotated images (0° and 180°)', () => {
            it('should handle 0 degree rotation', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: {...mockImageSizeWithRotation, rotation: 0},
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeAndroid(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 9,
                    aspectRatioHeight: 16,
                });
            });

            it('should handle 180 degree rotation', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: {...mockImageSizeWithRotation, rotation: 180},
                    aspectRatioWidth: 4,
                    aspectRatioHeight: 3,
                };
                const result = getDeviceOrientationAwareImageSizeAndroid(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 3,
                    aspectRatioHeight: 4,
                });
            });
        });

        describe('Rotated images (90° and 270°)', () => {
            it('should handle 90 degree rotation with dimension and aspect ratio swapping', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: {...mockImageSizeWithRotation, rotation: 90},
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeAndroid(params);
                expect(result).toEqual({
                    imageWidth: 1080,
                    imageHeight: 1920,
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                });
            });

            it('should handle 270 degree rotation with dimension and aspect ratio swapping', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: {...mockImageSizeWithRotation, rotation: 270},
                    aspectRatioWidth: 21,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeAndroid(params);
                expect(result).toEqual({
                    imageWidth: 1080,
                    imageHeight: 1920,
                    aspectRatioWidth: 21,
                    aspectRatioHeight: 9,
                });
            });
        });
    });
});
