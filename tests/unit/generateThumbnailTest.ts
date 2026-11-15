import {generateThumbnail} from '@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio';

const mockRenderAsync = jest.fn();
const mockSaveAsync = jest.fn();
const mockContextRelease = jest.fn();
const mockImageRelease = jest.fn();

jest.mock('expo-image-manipulator', () => ({
    ImageManipulator: {
        manipulate: () => ({
            resize: () => ({
                renderAsync: () => mockRenderAsync() as unknown,
                release: () => {
                    mockContextRelease();
                },
            }),
        }),
    },
    SaveFormat: {JPEG: 'jpeg'},
}));

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
    warn: jest.fn(),
}));

const THUMBNAIL_URI = 'file:///thumbnail.jpg';

function buildRenderedImage() {
    return {
        saveAsync: () => mockSaveAsync() as unknown,
        release: () => {
            mockImageRelease();
        },
    };
}

describe('generateThumbnail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSaveAsync.mockResolvedValue({uri: THUMBNAIL_URI, width: 512, height: 384});
        mockRenderAsync.mockImplementation(() => Promise.resolve(buildRenderedImage()));
    });

    it('decodes only one photo at a time when a list asks for many thumbnails together', async () => {
        let inFlight = 0;
        let peakInFlight = 0;

        // Hold each decode open long enough that any overlap would be observable in `peakInFlight`.
        mockRenderAsync.mockImplementation(() => {
            inFlight++;
            peakInFlight = Math.max(peakInFlight, inFlight);
            return new Promise((resolve) => {
                setImmediate(() => {
                    inFlight--;
                    resolve(buildRenderedImage());
                });
            });
        });

        // Given a report that mounts 13 receipt rows at once, as after a relaunch with 13 receipts waiting to upload
        const results = await Promise.all(Array.from({length: 13}, (value, index) => generateThumbnail(`file:///receipt-${index}.jpg`)));

        // Then the full-size decodes never overlap, and every row still gets its thumbnail
        expect(peakInFlight).toBe(1);
        expect(mockRenderAsync).toHaveBeenCalledTimes(13);
        expect(results).toEqual(Array.from({length: 13}, () => THUMBNAIL_URI));
    });

    it('skips the decode when the thumbnail is no longer needed', async () => {
        const result = await generateThumbnail('file:///receipt.jpg', {shouldSkip: () => true});

        expect(result).toBeUndefined();
        expect(mockRenderAsync).not.toHaveBeenCalled();
    });

    it('checks whether a thumbnail is still needed only when its turn comes', async () => {
        let isRowMounted = true;

        // Given two rows asking for thumbnails together
        const first = generateThumbnail('file:///first.jpg');
        const second = generateThumbnail('file:///second.jpg', {shouldSkip: () => !isRowMounted});

        // When the second row scrolls away while the first thumbnail is still being made
        isRowMounted = false;

        // Then only the first photo is decoded
        await expect(first).resolves.toBe(THUMBNAIL_URI);
        await expect(second).resolves.toBeUndefined();
        expect(mockRenderAsync).toHaveBeenCalledTimes(1);
    });

    it('keeps going after a thumbnail fails', async () => {
        mockRenderAsync.mockRejectedValueOnce(new Error('decode failed'));

        const [failed, next] = await Promise.all([generateThumbnail('file:///broken.jpg'), generateThumbnail('file:///next.jpg')]);

        expect(failed).toBeUndefined();
        expect(next).toBe(THUMBNAIL_URI);
    });

    it('releases the native image memory once the thumbnail is written', async () => {
        await generateThumbnail('file:///receipt.jpg');

        expect(mockImageRelease).toHaveBeenCalledTimes(1);
        expect(mockContextRelease).toHaveBeenCalledTimes(1);
    });

    it('releases the manipulator context even when the decode fails', async () => {
        mockRenderAsync.mockRejectedValueOnce(new Error('decode failed'));

        await generateThumbnail('file:///broken.jpg');

        expect(mockContextRelease).toHaveBeenCalledTimes(1);
    });
});
