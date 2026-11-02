import type {GetDeviceOrientationAwareImageSize} from '../../src/libs/cropOrRotateImage/getDeviceOrientationAwareImageSize/types';

import getDeviceOrientationAwareImageSizeDefault from '../../src/libs/cropOrRotateImage/getDeviceOrientationAwareImageSize/index';
import getDeviceOrientationAwareImageSizeAndroid from '../../src/libs/cropOrRotateImage/getDeviceOrientationAwareImageSize/index.android';

type GetDeviceOrientationAwareImageSizeParams = Parameters<GetDeviceOrientationAwareImageSize>[0];

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
    describe('Web and iOS Platforms', () => {
        it('should return the original dimensions and aspect ratio', () => {
            const params: GetDeviceOrientationAwareImageSizeParams = {
                imageSize: mockImageSize,
                aspectRatioWidth: 16,
                aspectRatioHeight: 9,
            };
            const result = getDeviceOrientationAwareImageSizeDefault(params);
            expect(result).toEqual({
                imageWidth: 1920,
                imageHeight: 1080,
                aspectRatioWidth: 16,
                aspectRatioHeight: 9,
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
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
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
                    aspectRatioWidth: 4,
                    aspectRatioHeight: 3,
                });
            });

            it('should handle a missing rotation as non-rotated', () => {
                const params: GetDeviceOrientationAwareImageSizeParams = {
                    imageSize: mockImageSize,
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                };
                const result = getDeviceOrientationAwareImageSizeAndroid(params);
                expect(result).toEqual({
                    imageWidth: 1920,
                    imageHeight: 1080,
                    aspectRatioWidth: 16,
                    aspectRatioHeight: 9,
                });
            });
        });

        describe('Rotated images (90° and 270°)', () => {
            it('should swap the dimensions for 90 degree rotation and keep the aspect ratio', () => {
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

            it('should swap the dimensions for 270 degree rotation and keep the aspect ratio', () => {
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
