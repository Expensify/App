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

    it('retries once when conversion fails, and succeeds on the retry', async () => {
        // "Image context has been lost" is the transient memory-pressure failure this retry exists for.
        mockRenderAsync.mockRejectedValueOnce(new Error('Image context has been lost'));
        mockRenderSuccess();
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const onFinish = jest.fn();

        convertHeicImage(heicFile, {onSuccess, onError, onFinish});
        await jest.runAllTimersAsync();

        expect(mockRenderAsync).toHaveBeenCalledTimes(2);
        expect(onError).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({type: 'image/jpeg'}));
        // The first attempt must not fire onFinish: the retry owns it, so the caller sees exactly one completion.
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('reports an error, and never falls back to the original HEIC, once the retry is exhausted', async () => {
        mockRenderAsync.mockRejectedValueOnce(new Error('Image context has been lost'));
        mockRenderAsync.mockRejectedValueOnce(new Error('Image context has been lost'));
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const onFinish = jest.fn();

        convertHeicImage(heicFile, {onSuccess, onError, onFinish});
        await jest.runAllTimersAsync();

        expect(mockRenderAsync).toHaveBeenCalledTimes(2);
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
});
