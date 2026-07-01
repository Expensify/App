import {ImageManipulator} from 'expo-image-manipulator';
import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';
import cropOrRotateImage from '@libs/cropOrRotateImage/index.native';
import CONST from '@src/CONST';

jest.mock('react-native-image-size');
jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {fs: {stat: jest.fn(() => Promise.resolve({size: 1024}))}},
}));
jest.mock('expo-image-manipulator', () => {
    const saveAsync = jest.fn(() => Promise.resolve({uri: 'file://cropped.jpg', width: 2400, height: 1800}));
    const renderAsync = jest.fn(() => Promise.resolve({saveAsync}));
    const context = {resize: jest.fn(), crop: jest.fn(), rotate: jest.fn(), renderAsync};
    return {
        ImageManipulator: {manipulate: jest.fn(() => context)},
        SaveFormat: {JPEG: 'jpeg', PNG: 'png', WEBP: 'webp'},
    };
});

const mockedGetSize = jest.mocked(ImageSize.getSize);
// `manipulate` returns the same context singleton on every call, so we can capture its action mocks once.
const probeContext = ImageManipulator.manipulate('probe');
/* eslint-disable @typescript-eslint/unbound-method */
const resizeMock = jest.mocked(probeContext.resize);
const cropMock = jest.mocked(probeContext.crop);
const rotateMock = jest.mocked(probeContext.rotate);
/* eslint-enable @typescript-eslint/unbound-method */

const options = {type: 'image/jpeg', name: 'cropped.jpg', compress: 1};

describe('cropOrRotateImage (native)', () => {
    let platformReplaceProperty: jest.ReplaceProperty<string>;

    beforeEach(() => {
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');
    });

    afterEach(() => {
        platformReplaceProperty.restore();
        jest.clearAllMocks();
    });

    it('bounds a crop that is still oversized, without dropping the crop action', async () => {
        mockedGetSize.mockResolvedValue({width: 12000, height: 9000});
        const crop = {originX: 0, originY: 0, width: 8000, height: 6000};

        await cropOrRotateImage('file://receipt.heic', [{crop}], options);

        expect(cropMock).toHaveBeenCalledWith(crop);
        expect(resizeMock).toHaveBeenCalledWith({width: CONST.MAX_IMAGE_DIMENSION});
    });

    it('does not resize when the cropped output already fits the budget', async () => {
        mockedGetSize.mockResolvedValue({width: 12000, height: 9000});
        const crop = {originX: 0, originY: 0, width: 1000, height: 800};

        await cropOrRotateImage('file://receipt.heic', [{crop}], options);

        expect(cropMock).toHaveBeenCalledWith(crop);
        expect(resizeMock).not.toHaveBeenCalled();
    });

    it('bounds a rotate-only large image using the rotated dimensions', async () => {
        mockedGetSize.mockResolvedValue({width: 8000, height: 6000});

        await cropOrRotateImage('file://photo.heic', [{rotate: 90}], options);

        expect(rotateMock).toHaveBeenCalledWith(90);
        // After a 90° rotate the 8000×6000 source becomes 6000×8000, so the taller side is bounded.
        expect(resizeMock).toHaveBeenCalledWith({height: CONST.MAX_IMAGE_DIMENSION});
    });
});
