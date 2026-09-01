import processPickedAssetsSequentially from '@libs/fileDownload/processPickedAssets';

import type {Asset} from 'react-native-image-picker';

const mockVerifyFileFormat = jest.fn();
const mockRenderAsync = jest.fn();
const mockSaveAsync = jest.fn();
const mockRelease = jest.fn();
const mockImageRelease = jest.fn();

jest.mock('@libs/fileDownload/FileUtils', () => ({
    verifyFileFormat: () => mockVerifyFileFormat() as unknown,
}));

jest.mock('expo-image-manipulator', () => ({
    ImageManipulator: {
        manipulate: () => ({
            renderAsync: () => mockRenderAsync() as unknown,
            release: () => {
                mockRelease();
            },
        }),
    },
    SaveFormat: {JPEG: 'jpeg'},
}));

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));

const buildHeicAssets = (count: number): Asset[] =>
    Array.from({length: count}, (value, index) => ({
        uri: `file:///photo-${index}.heic`,
        fileName: `photo-${index}.heic`,
        type: 'image/heic',
    }));

const showGeneralAlert = jest.fn();
const translate = jest.fn(() => 'conversion failed');

describe('processPickedAssetsSequentially', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockVerifyFileFormat.mockResolvedValue(true);
        mockSaveAsync.mockResolvedValue({uri: 'file:///photo.jpg', width: 100, height: 200});
        mockRenderAsync.mockImplementation(() =>
            Promise.resolve({
                saveAsync: () => mockSaveAsync() as unknown,
                release: () => {
                    mockImageRelease();
                },
            }),
        );
    });

    it('decodes only one image at a time', async () => {
        let inFlight = 0;
        let peakInFlight = 0;

        // Hold each decode open long enough that any overlap would be observable in `peakInFlight`.
        mockRenderAsync.mockImplementation(() => {
            inFlight++;
            peakInFlight = Math.max(peakInFlight, inFlight);
            return new Promise((resolve) => {
                setImmediate(() => {
                    inFlight--;
                    resolve({
                        saveAsync: () => mockSaveAsync() as unknown,
                        release: () => {
                            mockImageRelease();
                        },
                    });
                });
            });
        });

        const result = await processPickedAssetsSequentially(buildHeicAssets(30), showGeneralAlert, translate);

        expect(peakInFlight).toBe(1);
        expect(mockRenderAsync).toHaveBeenCalledTimes(30);
        expect(result).toHaveLength(30);
    });

    it('releases the native image resources for every converted asset', async () => {
        await processPickedAssetsSequentially(buildHeicAssets(5), showGeneralAlert, translate);

        expect(mockRelease).toHaveBeenCalledTimes(5);
        expect(mockImageRelease).toHaveBeenCalledTimes(5);
    });

    it('releases the manipulator context even when the conversion fails', async () => {
        mockRenderAsync.mockRejectedValue(new Error('decode failed'));

        await processPickedAssetsSequentially(buildHeicAssets(3), showGeneralAlert, translate);

        expect(mockRelease).toHaveBeenCalledTimes(3);
    });

    it('skips assets that fail to convert instead of uploading the raw HEIC', async () => {
        mockRenderAsync.mockRejectedValue(new Error('decode failed'));

        const result = await processPickedAssetsSequentially(buildHeicAssets(3), showGeneralAlert, translate);

        expect(result).toBeUndefined();
    });

    it('shows a single alert when the whole selection fails the same way', async () => {
        mockRenderAsync.mockRejectedValue(new Error('decode failed'));

        await processPickedAssetsSequentially(buildHeicAssets(30), showGeneralAlert, translate);

        expect(showGeneralAlert).toHaveBeenCalledTimes(1);
    });

    it('passes non-HEIC images through without decoding them', async () => {
        mockVerifyFileFormat.mockResolvedValue(false);

        const result = await processPickedAssetsSequentially([{uri: 'file:///photo.jpg', fileName: 'photo.jpg', type: 'image/jpeg'}], showGeneralAlert, translate);

        expect(mockRenderAsync).not.toHaveBeenCalled();
        expect(result).toHaveLength(1);
    });
});
