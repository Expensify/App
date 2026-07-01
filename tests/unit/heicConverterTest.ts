import {ImageManipulator} from 'expo-image-manipulator';
import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';
import convertHeicImage from '@libs/fileDownload/heicConverter/index.native';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

jest.mock('react-native-image-size');
jest.mock('expo-image-manipulator', () => {
    const saveAsync = jest.fn(() => Promise.resolve({uri: 'file://converted.jpg', width: 2400, height: 1800}));
    const renderAsync = jest.fn(() => Promise.resolve({saveAsync}));
    const context = {resize: jest.fn(), crop: jest.fn(), rotate: jest.fn(), renderAsync};
    return {
        ImageManipulator: {manipulate: jest.fn(() => context)},
        SaveFormat: {JPEG: 'jpeg', PNG: 'png', WEBP: 'webp'},
    };
});

const mockedGetSize = jest.mocked(ImageSize.getSize);
// `manipulate` returns the same context singleton on every call, so we can capture its `resize` mock once.
// eslint-disable-next-line @typescript-eslint/unbound-method
const resizeMock = jest.mocked(ImageManipulator.manipulate('probe').resize);

const heicFile: FileObject = {name: 'photo.heic', uri: 'file://photo.heic', type: 'image/heic'};

const convertHeic = (file: FileObject) =>
    new Promise<FileObject>((resolve, reject) => {
        convertHeicImage(file, {onSuccess: resolve, onError: (error) => reject(error)});
    });

describe('convertHeicImage (native)', () => {
    let platformReplaceProperty: jest.ReplaceProperty<string>;

    beforeEach(() => {
        platformReplaceProperty = jest.replaceProperty(Platform, 'OS', 'ios');
    });

    afterEach(() => {
        platformReplaceProperty.restore();
        jest.clearAllMocks();
    });

    it('caps the decode dimensions for a large HEIC photo before rendering', async () => {
        mockedGetSize.mockResolvedValue({width: 8000, height: 6000});

        await convertHeic(heicFile);

        expect(resizeMock).toHaveBeenCalledWith({width: CONST.MAX_IMAGE_DIMENSION});
    });

    it('does not resize a HEIC photo that already fits within the budget', async () => {
        mockedGetSize.mockResolvedValue({width: 1200, height: 800});

        await convertHeic(heicFile);

        expect(resizeMock).not.toHaveBeenCalled();
    });

    it('returns the original file untouched when it is not a HEIC/HEIF image', async () => {
        const jpegFile: FileObject = {name: 'photo.jpg', uri: 'file://photo.jpg', type: 'image/jpeg'};

        const result = await convertHeic(jpegFile);

        expect(result).toBe(jpegFile);
        expect(resizeMock).not.toHaveBeenCalled();
    });
});
