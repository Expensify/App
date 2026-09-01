import type {LocaleContextProps} from '@components/LocaleContextProvider';

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
// Returns the key itself so assertions can tell the different failure messages apart.
const translate: LocaleContextProps['translate'] = (path, ...parameters): string => (parameters.length > 0 ? `${path}:${parameters.length}` : path);

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
    it('preserves selection order across mixed HEIC and non-HEIC assets', async () => {
        mockVerifyFileFormat.mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        mockSaveAsync.mockResolvedValueOnce({uri: 'file:///a-converted.jpg', width: 1, height: 1}).mockResolvedValueOnce({uri: 'file:///c-converted.jpg', width: 1, height: 1});

        const result = await processPickedAssetsSequentially(
            [
                {uri: 'file:///a.heic', fileName: 'a.heic', type: 'image/heic'},
                {uri: 'file:///b.jpg', fileName: 'b.jpg', type: 'image/jpeg'},
                {uri: 'file:///c.heic', fileName: 'c.heic', type: 'image/heic'},
            ],
            showGeneralAlert,
            translate,
        );

        expect(result?.map((asset) => asset.fileName)).toEqual(['a-converted.jpg', 'b.jpg', 'c-converted.jpg']);
    });

    it('skips assets that have no uri', async () => {
        const result = await processPickedAssetsSequentially([{fileName: 'no-uri.heic', type: 'image/heic'}], showGeneralAlert, translate);

        expect(mockVerifyFileFormat).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('passes non-image assets through without checking the file format', async () => {
        const result = await processPickedAssetsSequentially([{uri: 'file:///doc.pdf', fileName: 'doc.pdf', type: 'application/pdf'}], showGeneralAlert, translate);

        expect(mockVerifyFileFormat).not.toHaveBeenCalled();
        expect(result?.at(0)?.fileName).toBe('doc.pdf');
    });

    it('surfaces the underlying message when the format check fails', async () => {
        mockVerifyFileFormat.mockRejectedValueOnce(new Error('format check failed'));

        await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        expect(showGeneralAlert).toHaveBeenCalledWith('format check failed');
    });

    it('falls back to localized copy when the failure is not an Error', async () => {
        mockVerifyFileFormat.mockRejectedValueOnce('not an error object');

        await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileSelectingAttachment');
    });

    it('shows one alert even when the selection fails in different ways', async () => {
        mockVerifyFileFormat.mockRejectedValueOnce(new Error('format check failed'));
        mockRenderAsync.mockRejectedValue(new Error('decode failed'));

        await processPickedAssetsSequentially(buildHeicAssets(2), showGeneralAlert, translate);

        expect(showGeneralAlert).toHaveBeenCalledTimes(1);
        expect(showGeneralAlert).toHaveBeenCalledWith('format check failed\nattachmentPicker.errorWhileConvertingHeic');
    });
});
