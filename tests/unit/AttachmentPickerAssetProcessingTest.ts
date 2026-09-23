import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import processPickedAssetsSequentially from '@libs/fileDownload/processPickedAssets';

import type {Asset} from 'react-native-image-picker';

const mockReadFileHeaderHex = jest.fn<Promise<string>, [string]>();
const mockRenderAsync = jest.fn();
const mockSaveAsync = jest.fn();
const mockRelease = jest.fn();
const mockImageRelease = jest.fn();

jest.mock('@libs/fileDownload/FileUtils', () => ({
    ...jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils'),
    getFileName: (url: string) => url.split('/').pop()?.split('?').at(0) ?? '',
    readFileHeaderHex: (fileUri: string) => mockReadFileHeaderHex(fileUri),
}));

// Real 16-byte headers, so the actual `matchesFileSignature` decides the format.
const HEIC_HEADER_HEX = '00000018667479706865696300000000'; // box size, then 'ftypheic' at offset 4
const TIFF_HEADER_HEX = '49492a00080000000000000000000000'; // 'II*\0' at offset 0
const JPEG_HEADER_HEX = 'ffd8ffe000104a464946000101000001'; // JFIF

/**
 * Returns the header the file's real extension implies, the way the disk read would, so a test can describe a
 * selection by URIs alone. The picker itself would have relabelled these `.jpg`.
 */
const readHeaderFromExtension = (fileUri: string): Promise<string> => {
    if (fileUri.endsWith('.heic')) {
        return Promise.resolve(HEIC_HEADER_HEX);
    }
    if (fileUri.endsWith('.dng') || fileUri.endsWith('.tif')) {
        return Promise.resolve(TIFF_HEADER_HEX);
    }
    return Promise.resolve(JPEG_HEADER_HEX);
};

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
        mockReadFileHeaderHex.mockImplementation(readHeaderFromExtension);
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

    it('passes real JPEGs through without decoding them', async () => {
        // Given a picked asset whose bytes match neither the HEIC nor the TIFF/DNG signature
        // When the selection is processed
        const result = await processPickedAssetsSequentially([{uri: 'file:///photo.jpg', fileName: 'photo.jpg', type: 'image/jpeg'}], showGeneralAlert, translate);

        // Then the header is read once for both signatures and the asset is kept as-is without a transcode
        expect(mockReadFileHeaderHex).toHaveBeenCalledTimes(1);
        expect(mockRenderAsync).not.toHaveBeenCalled();
        expect(result).toHaveLength(1);
    });

    it('transcodes a gallery-picked DNG (ProRAW) that the picker labelled as JPEG', async () => {
        // Given a ProRAW photo: react-native-image-picker sniffs one byte, doesn't recognize the TIFF header and names it `<uuid>.jpg`
        const pickedAsset: Asset = {uri: 'file:///D1F3.dng', fileName: 'D1F3.jpg', type: 'image/jpg'};
        mockSaveAsync.mockResolvedValueOnce({uri: 'file:///D1F3-converted.jpg', width: 4032, height: 3024});

        // When the selection is processed
        const result = await processPickedAssetsSequentially([pickedAsset], showGeneralAlert, translate);

        // Then the TIFF signature is found in the header and the asset is replaced by a real JPEG instead of a mislabelled DNG that would fail `ImageSize.getSize`
        expect(mockReadFileHeaderHex).toHaveBeenCalledWith(pickedAsset.uri);
        expect(mockRenderAsync).toHaveBeenCalledTimes(1);
        expect(result).toEqual([{uri: 'file:///D1F3-converted.jpg', fileName: 'D1F3.jpg', type: 'image/jpeg', width: 4032, height: 3024}]);
        expect(showGeneralAlert).not.toHaveBeenCalled();
    });

    it('transcodes an Android gallery pick that keeps its DNG name and MIME type without reading the file', async () => {
        // Given a DNG as Android's picker reports it: real file name, MIME type resolved from the extension
        const pickedAsset: Asset = {uri: 'file:///data/user/0/app/cache/1a2b.dng', fileName: 'PXL_20260101.dng', type: 'image/x-adobe-dng'};
        mockSaveAsync.mockResolvedValueOnce({uri: 'file:///data/user/0/app/cache/1a2b-converted.jpg', width: 4000, height: 3000});

        // When the selection is processed
        const result = await processPickedAssetsSequentially([pickedAsset], showGeneralAlert, translate);

        // Then the label is trusted, so no header read happens (Android streams the file for that), and the JPEG keeps the name the user picked
        expect(mockReadFileHeaderHex).not.toHaveBeenCalled();
        expect(mockRenderAsync).toHaveBeenCalledTimes(1);
        expect(result?.at(0)).toMatchObject({uri: 'file:///data/user/0/app/cache/1a2b-converted.jpg', fileName: 'PXL_20260101.jpg', type: 'image/jpeg'});
    });

    it('still transcodes a DNG when Android reports no MIME type for it', async () => {
        // Given a device whose MIME map doesn't know DNG, so the picker sends `type: null` for a file still named `.dng`
        const pickedAsset: Asset = {uri: 'file:///data/user/0/app/cache/1a2b.dng', fileName: 'PXL_20260101.dng', type: undefined};

        // When the selection is processed
        const result = await processPickedAssetsSequentially([pickedAsset], showGeneralAlert, translate);

        // Then the extension keeps it on the image path instead of passing it through as a generic file the backend would reject
        expect(mockRenderAsync).toHaveBeenCalledTimes(1);
        expect(result?.at(0)?.type).toBe('image/jpeg');
    });

    it('uploads a labelled TIFF as-is instead of transcoding it', async () => {
        // Given a scanned receipt saved as TIFF: an accepted receipt format that may have several pages, of which a transcode would keep only the first
        const pickedAsset: Asset = {uri: 'file:///scan.tif', fileName: 'scan.tif', type: 'image/tiff'};

        // When the selection is processed
        const result = await processPickedAssetsSequentially([pickedAsset], showGeneralAlert, translate);

        // Then the label is trusted, so its TIFF header (which a DNG shares) is never read and the file is passed through untouched
        expect(mockReadFileHeaderHex).not.toHaveBeenCalled();
        expect(mockRenderAsync).not.toHaveBeenCalled();
        expect(result).toEqual([pickedAsset]);
    });

    it('recognizes HEIC from the ftyp box after the 4-byte box size', async () => {
        // Given a HEIC whose `ftyp` signature sits at offset 4 of its header
        // When the selection is processed
        const result = await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        // Then the header is read once, the HEIC signature matches at CONST.HEIC_SIGNATURE_OFFSET and the asset is transcoded
        expect(mockReadFileHeaderHex).toHaveBeenCalledTimes(1);
        expect(mockRenderAsync).toHaveBeenCalledTimes(1);
        expect(result?.at(0)?.type).toBe('image/jpeg');
    });

    it('does not mistake a header with `ftyp` at offset 0 for HEIC', async () => {
        // Given a header whose HEIC signature starts at byte 0 instead of after the box size
        mockReadFileHeaderHex.mockResolvedValueOnce(HEIC_HEADER_HEX.slice(8));

        // When the selection is processed
        await processPickedAssetsSequentially([{uri: 'file:///odd.jpg', fileName: 'odd.jpg', type: 'image/jpeg'}], showGeneralAlert, translate);

        // Then the offset matters and nothing is transcoded
        expect(mockRenderAsync).not.toHaveBeenCalled();
    });

    it('falls back to the converted file name when the picker gives none', async () => {
        // Given a HEIC the picker returned without a file name
        mockSaveAsync.mockResolvedValueOnce({uri: 'file:///cache/ABCD.jpg', width: 1, height: 1});

        // When the selection is processed
        const result = await processPickedAssetsSequentially([{uri: 'file:///photo.heic', type: 'image/heic'}], showGeneralAlert, translate);

        // Then the JPEG is named after the file ImageManipulator saved, since there is no picked name to keep
        expect(result?.at(0)?.fileName).toBe('ABCD.jpg');
    });

    it('alerts with the generic processing message when a DNG cannot be decoded', async () => {
        // Given a DNG on a device whose image loader can't decode it
        mockRenderAsync.mockRejectedValue(new Error('decode failed'));

        // When the selection is processed
        const result = await processPickedAssetsSequentially([{uri: 'file:///raw.dng', fileName: 'raw.jpg', type: 'image/jpg'}], showGeneralAlert, translate);

        // Then the asset is dropped and the user sees the in-app processing message rather than a native corruption error further down the line
        expect(result).toBeUndefined();
        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileConvertingImage');
    });

    it('preserves selection order across mixed HEIC, DNG and JPEG assets', async () => {
        // Given a selection whose formats interleave, with each transcode saved under a distinct output file
        mockSaveAsync
            .mockResolvedValueOnce({uri: 'file:///a-converted.jpg', width: 1, height: 1})
            .mockResolvedValueOnce({uri: 'file:///c-converted.jpg', width: 1, height: 1})
            .mockResolvedValueOnce({uri: 'file:///d-converted.jpg', width: 1, height: 1});

        // When the selection is processed
        const result = await processPickedAssetsSequentially(
            [
                {uri: 'file:///a.heic', fileName: 'a.heic', type: 'image/heic'},
                {uri: 'file:///b.jpg', fileName: 'b.jpg', type: 'image/jpeg'},
                {uri: 'file:///c.heic', fileName: 'c.heic', type: 'image/heic'},
                {uri: 'file:///d.dng', fileName: 'd.jpg', type: 'image/jpg'},
            ],
            showGeneralAlert,
            translate,
        );

        // Then the output keeps the order the user picked in, regardless of which assets were transcoded
        expect(result?.map((asset) => asset.uri)).toEqual(['file:///a-converted.jpg', 'file:///b.jpg', 'file:///c-converted.jpg', 'file:///d-converted.jpg']);
    });

    it('skips assets that have no uri', async () => {
        const result = await processPickedAssetsSequentially([{fileName: 'no-uri.heic', type: 'image/heic'}], showGeneralAlert, translate);

        expect(mockReadFileHeaderHex).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('passes non-image assets through without checking the file format', async () => {
        const result = await processPickedAssetsSequentially([{uri: 'file:///doc.pdf', fileName: 'doc.pdf', type: 'application/pdf'}], showGeneralAlert, translate);

        expect(mockReadFileHeaderHex).not.toHaveBeenCalled();
        expect(result?.at(0)?.fileName).toBe('doc.pdf');
    });

    it('shows the generic message instead of the native error when the header read fails', async () => {
        // Given a header read that rejects with a native filesystem error
        mockReadFileHeaderHex.mockRejectedValueOnce(new Error('EACCES: permission denied'));

        // When the selection is processed
        await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        // Then the user sees localized copy rather than an error code that means nothing to them
        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileSelectingAttachment');
    });

    it('falls back to localized copy when the failure is not an Error', async () => {
        mockReadFileHeaderHex.mockRejectedValueOnce('not an error object');

        await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileSelectingAttachment');
    });

    it('shows one alert even when the selection fails in different ways', async () => {
        mockReadFileHeaderHex.mockRejectedValueOnce(new Error('format check failed'));
        mockRenderAsync.mockRejectedValue(new Error('decode failed'));

        await processPickedAssetsSequentially(buildHeicAssets(2), showGeneralAlert, translate);

        expect(showGeneralAlert).toHaveBeenCalledTimes(1);
        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileSelectingAttachment\nattachmentPicker.errorWhileConvertingImage');
    });
    it.each([
        ['the rendered image', () => mockImageRelease],
        ['the manipulator context', () => mockRelease],
    ])('keeps a converted asset even if releasing %s throws', async (name, getMock) => {
        getMock().mockImplementation(() => {
            throw new Error('release blew up');
        });

        const result = await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        expect(result).toHaveLength(1);
        expect(showGeneralAlert).not.toHaveBeenCalled();
    });
    it('derives fileName from the uri and defaults type when the picker omits them', async () => {
        const result = await processPickedAssetsSequentially([{uri: 'file:///scan.pdf'}], showGeneralAlert, translate);

        expect(result?.at(0)?.fileName).toBe('scan.pdf');
        expect(result?.at(0)?.type).toBe('image/jpeg');
    });

    it('releases the rendered image and skips the asset when saving fails', async () => {
        mockSaveAsync.mockRejectedValue(new Error('encode failed'));

        const result = await processPickedAssetsSequentially(buildHeicAssets(1), showGeneralAlert, translate);

        expect(result).toBeUndefined();
        expect(mockImageRelease).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalledTimes(1);
        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileConvertingImage');
    });

    it('returns the successful assets and still alerts when some fail', async () => {
        mockRenderAsync
            .mockResolvedValueOnce({
                saveAsync: () => mockSaveAsync() as unknown,
                release: () => {
                    mockImageRelease();
                },
            })
            .mockRejectedValueOnce(new Error('decode failed'))
            .mockResolvedValueOnce({
                saveAsync: () => mockSaveAsync() as unknown,
                release: () => {
                    mockImageRelease();
                },
            });

        const result = await processPickedAssetsSequentially(buildHeicAssets(3), showGeneralAlert, translate);

        expect(result).toHaveLength(2);
        expect(showGeneralAlert).toHaveBeenCalledTimes(1);
        expect(showGeneralAlert).toHaveBeenCalledWith('attachmentPicker.errorWhileConvertingImage');
    });
});
