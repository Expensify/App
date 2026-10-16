import convertHeicImage from '@libs/fileDownload/heicConverter/index.native';

const mockSaveAsync = jest.fn();
const mockRenderAsync = jest.fn();

jest.mock('expo-image-manipulator', () => ({
    ImageManipulator: {
        manipulate: () => ({
            renderAsync: () => mockRenderAsync() as unknown,
        }),
    },
    SaveFormat: {JPEG: 'jpeg'},
}));

const mockStat = jest.fn<Promise<{size: number}>, [string]>();

jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {
        fs: {
            stat: (...args: [string]) => mockStat(...args),
        },
    },
}));

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));

const heicFile = {uri: 'file:///photo.heic', name: 'photo.heic', type: 'image/heic', size: 1024};

const mockRenderSuccess = () => mockRenderAsync.mockResolvedValueOnce({saveAsync: () => mockSaveAsync() as unknown});

describe('convertHeicImage (native)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockSaveAsync.mockResolvedValue({uri: 'file:///photo.jpg', width: 100, height: 200});
        mockStat.mockResolvedValue({size: 512});
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('converts a HEIC file to JPEG and reports success', async () => {
        mockRenderSuccess();
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const onFinish = jest.fn();

        convertHeicImage(heicFile, {onSuccess, onError, onFinish});
        await jest.runAllTimersAsync();

        expect(onError).not.toHaveBeenCalled();
        expect(onFinish).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg'}));
    });

    it('reports an error on conversion failure, and never falls back to the original HEIC', async () => {
        mockRenderAsync.mockRejectedValueOnce(new Error('Image context has been lost'));
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const onFinish = jest.fn();

        convertHeicImage(heicFile, {onSuccess, onError, onFinish});
        await jest.runAllTimersAsync();

        expect(mockRenderAsync).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onFinish).toHaveBeenCalledTimes(1);
        // The raw HEIC must never be surfaced as a success: the server rejects image/heic.
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('passes non-HEIC files straight through without conversion', async () => {
        const onSuccess = jest.fn();
        const jpegFile = {uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg', size: 1024};

        convertHeicImage(jpegFile, {onSuccess});
        await jest.runAllTimersAsync();

        expect(mockRenderAsync).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(jpegFile);
    });

    it.each([
        ['by extension', {uri: 'file:///IMG_0001.DNG', name: 'IMG_0001.DNG', type: 'image/x-adobe-dng', size: 50_000_000}, 'IMG_0001.jpg'],
        ['by MIME type', {uri: 'file:///raw', name: 'raw', type: 'image/x-adobe-dng', size: 50_000_000}, 'raw.jpg'],
        ['with no image type', {uri: 'file:///IMG_0001.dng', name: 'IMG_0001.dng', type: 'application/octet-stream', size: 50_000_000}, 'IMG_0001.jpg'],
    ])('converts a DNG labelled %s to JPEG', async (description, dngFile, expectedName) => {
        // Given a DNG (the backend rejects it, so it must be converted), possibly without an image/* type as on some Android devices
        mockRenderSuccess();
        const onSuccess = jest.fn();
        const onError = jest.fn();

        // When it is run through the converter
        convertHeicImage(dngFile, {onSuccess, onError});
        await jest.runAllTimersAsync();

        // Then a JPEG named after the original comes back
        expect(onError).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({uri: 'file:///photo.jpg', name: expectedName, type: 'image/jpeg'}));
    });

    it('reports the size of the converted JPEG rather than the original', async () => {
        // Given a 50 MB DNG whose JPEG is 512 bytes on disk
        mockRenderSuccess();
        const onSuccess = jest.fn();

        // When it is converted
        convertHeicImage({uri: 'file:///IMG_0001.DNG', name: 'IMG_0001.DNG', type: 'image/x-adobe-dng', size: 50_000_000}, {onSuccess});
        await jest.runAllTimersAsync();

        // Then the JPEG's size is reported, so the upload size limits apply to what is actually uploaded
        expect(mockStat).toHaveBeenCalledWith('/photo.jpg');
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({size: 512}));
    });

    it("falls back to the original size when the JPEG's size can't be read", async () => {
        // Given the converted JPEG can't be stat'ed
        mockRenderSuccess();
        mockStat.mockRejectedValueOnce(new Error('ENOENT'));
        const onSuccess = jest.fn();
        const onError = jest.fn();

        // When a HEIC is converted
        convertHeicImage(heicFile, {onSuccess, onError});
        await jest.runAllTimersAsync();

        // Then the conversion still succeeds, keeping the original size as before
        expect(onError).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({size: heicFile.size}));
    });
});
