import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';
import getBoundedImageResize, {getBoundedResizeForDimensions} from '@libs/getBoundedImageResize';
import CONST from '@src/CONST';

jest.mock('react-native-image-size');

const mockedGetSize = jest.mocked(ImageSize.getSize);
const MAX = CONST.MAX_IMAGE_DIMENSION;

describe('getBoundedImageResize', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('on non-iOS platforms', () => {
        const nonIOSPlatforms = ['android', 'web', 'macos', 'windows'] as const;

        describe.each(nonIOSPlatforms)('%s', (platform) => {
            let platformReplaceProperty: jest.ReplaceProperty<string>;

            beforeEach(() => {
                platformReplaceProperty = jest.replaceProperty(Platform, 'OS', platform);
            });

            afterEach(() => {
                platformReplaceProperty.restore();
            });

            it('returns undefined without reading the image size (the cap is iOS-only)', async () => {
                const result = await getBoundedImageResize('file://photo.heic');

                expect(result).toBeUndefined();
                expect(mockedGetSize).not.toHaveBeenCalled();
            });
        });
    });

    describe('on iOS', () => {
        let platformReplaceProperty: jest.ReplaceProperty<string>;

        beforeEach(() => {
            platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');
        });

        afterEach(() => {
            platformReplaceProperty.restore();
        });

        it('returns undefined when the image already fits within the budget (so it does not upscale)', async () => {
            mockedGetSize.mockResolvedValue({width: 1200, height: 800});

            const result = await getBoundedImageResize('file://small.heic');

            expect(result).toBeUndefined();
        });

        it('returns undefined when the longest side equals the budget (boundary is inclusive)', async () => {
            mockedGetSize.mockResolvedValue({width: MAX, height: 1000});

            const result = await getBoundedImageResize('file://exact.heic');

            expect(result).toBeUndefined();
        });

        it('caps the width for a landscape image that exceeds the budget', async () => {
            mockedGetSize.mockResolvedValue({width: 8000, height: 6000});

            const result = await getBoundedImageResize('file://landscape.heic');

            expect(result).toEqual({width: MAX});
        });

        it('caps the height for a portrait image that exceeds the budget', async () => {
            mockedGetSize.mockResolvedValue({width: 6000, height: 8000});

            const result = await getBoundedImageResize('file://portrait.heic');

            expect(result).toEqual({height: MAX});
        });

        it('caps the width for a square image that exceeds the budget', async () => {
            mockedGetSize.mockResolvedValue({width: 8000, height: 8000});

            const result = await getBoundedImageResize('file://square.heic');

            expect(result).toEqual({width: MAX});
        });

        it('falls back to no resize when the image size cannot be read', async () => {
            mockedGetSize.mockRejectedValue(new Error('Could not read image size'));

            const result = await getBoundedImageResize('file://corrupt.heic');

            expect(result).toBeUndefined();
        });
    });
});

describe('getBoundedResizeForDimensions', () => {
    describe('on non-iOS platforms', () => {
        let platformReplaceProperty: jest.ReplaceProperty<string>;

        beforeEach(() => {
            platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'android');
        });

        afterEach(() => {
            platformReplaceProperty.restore();
        });

        it('returns undefined even for an oversized image (the cap is iOS-only)', () => {
            expect(getBoundedResizeForDimensions(8000, 6000)).toBeUndefined();
        });
    });

    describe('on iOS', () => {
        let platformReplaceProperty: jest.ReplaceProperty<string>;

        beforeEach(() => {
            platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');
        });

        afterEach(() => {
            platformReplaceProperty.restore();
        });

        it('returns undefined when both sides fit within the budget', () => {
            expect(getBoundedResizeForDimensions(2000, 1500)).toBeUndefined();
        });

        it('caps the width for an oversized landscape crop', () => {
            expect(getBoundedResizeForDimensions(8000, 6000)).toEqual({width: MAX});
        });

        it('caps the height for an oversized portrait crop', () => {
            expect(getBoundedResizeForDimensions(6000, 8000)).toEqual({height: MAX});
        });
    });
});
