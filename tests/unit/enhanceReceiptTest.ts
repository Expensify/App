import enhanceReceipt, {ENHANCE_TIMEOUT_MS} from '@pages/iou/request/step/IOURequestStepScan/documentDetection/enhanceReceipt';

import CONST from '@src/CONST';

import type {DetectedDocument, DocumentCorner} from '@expensify/nitro-utils';
import type {Image} from 'react-native-nitro-image';

const mockDetectInImage = jest.fn<Promise<DetectedDocument | undefined>, [Image]>();
const mockWarpImage = jest.fn<Promise<Image>, [Image, DocumentCorner[], number]>();
let mockIsDetectorAvailable = true;

jest.mock('@expensify/nitro-utils', () => ({
    getDocumentDetectorNitroModule: () => (mockIsDetectorAvailable ? {detectInImage: mockDetectInImage, warpImage: mockWarpImage} : null),
}));

const MIN_CONFIDENCE = 0.5;

function createImage(width: number, height: number): Image {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements the members enhanceReceipt uses
    return {width, height, dispose: jest.fn()} as unknown as Image;
}

const CENTRED_RECEIPT: DetectedDocument = {
    corners: [
        {x: 0.2, y: 0.1},
        {x: 0.8, y: 0.1},
        {x: 0.8, y: 0.9},
        {x: 0.2, y: 0.9},
    ],
    confidence: 0.9,
};

describe('enhanceReceipt', () => {
    beforeEach(() => {
        mockIsDetectorAvailable = true;
        mockDetectInImage.mockReset();
        mockWarpImage.mockReset();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns the straightened receipt when a receipt is found', async () => {
        // Given a capture with a receipt in the middle, and a warp that hands back a new image
        const capture = createImage(1000, 1000);
        const warped = createImage(640, 850);
        mockDetectInImage.mockResolvedValue(CENTRED_RECEIPT);
        mockWarpImage.mockResolvedValue(warped);

        // When the capture is enhanced
        const result = await enhanceReceipt(capture, MIN_CONFIDENCE);

        // Then the warped image is the one to save, warped from pixel corners within the upload size, since that is the
        // receipt SmartScan reads and the expense shows
        expect(result.image).toBe(warped);
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.CROPPED);
        const [, quad, maxLongSide] = mockWarpImage.mock.calls.at(0) ?? [];
        expect(quad?.at(0)?.x).toBeLessThan(200);
        expect(maxLongSide).toBe(CONST.RECEIPT_CAMERA.PHOTO_WIDTH);
    });

    it('keeps the full frame when no receipt is found', async () => {
        // Given a capture the detector finds no receipt in, like a photo of a screen
        const capture = createImage(1000, 1000);
        mockDetectInImage.mockResolvedValue(undefined);

        // When the capture is enhanced
        const result = await enhanceReceipt(capture, MIN_CONFIDENCE);

        // Then the capture is saved as taken, with no error, as the spec asks for a failed detection
        expect(result.image).toBe(capture);
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.NO_DOCUMENT);
        expect(mockWarpImage).not.toHaveBeenCalled();
    });

    it('keeps the full frame when the detection is too unsure to crop to', async () => {
        // Given a receipt found with less confidence than the platform shows the outline for
        const capture = createImage(1000, 1000);
        mockDetectInImage.mockResolvedValue({...CENTRED_RECEIPT, confidence: MIN_CONFIDENCE - 0.1});

        // When the capture is enhanced
        const result = await enhanceReceipt(capture, MIN_CONFIDENCE);

        // Then nothing is cut, because a crop to a wrong edge would lose part of the receipt for good
        expect(result.image).toBe(capture);
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.SKIPPED);
        expect(mockWarpImage).not.toHaveBeenCalled();
    });

    it('keeps the full frame when the native module fails', async () => {
        // Given a warp that throws, as an out-of-memory bitmap would
        const capture = createImage(1000, 1000);
        mockDetectInImage.mockResolvedValue(CENTRED_RECEIPT);
        mockWarpImage.mockRejectedValue(new Error('out of memory'));

        // When the capture is enhanced
        const result = await enhanceReceipt(capture, MIN_CONFIDENCE);

        // Then the capture is still saved, so a failed crop never fails the scan
        expect(result.image).toBe(capture);
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.FAILED);
    });

    it('keeps the full frame when the detector is not built into the app', async () => {
        // Given an app build whose native code has no detector
        mockIsDetectorAvailable = false;
        const capture = createImage(1000, 1000);

        // When the capture is enhanced
        const result = await enhanceReceipt(capture, MIN_CONFIDENCE);

        // Then the capture is saved as taken
        expect(result.image).toBe(capture);
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.SKIPPED);
    });

    it('keeps the full frame and releases the late result when the crop takes too long', async () => {
        // Given a warp that finishes only after the time limit
        jest.useFakeTimers();
        const capture = createImage(1000, 1000);
        const lateWarpDispose = jest.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock only implements the members enhanceReceipt uses
        const lateWarp = {width: 640, height: 850, dispose: lateWarpDispose} as unknown as Image;
        let finishWarp: (image: Image) => void = () => {};
        mockDetectInImage.mockResolvedValue(CENTRED_RECEIPT);
        mockWarpImage.mockReturnValue(
            new Promise<Image>((resolve) => {
                finishWarp = resolve;
            }),
        );

        // When the time limit passes before the warp finishes, and the warp then lands
        const pending = enhanceReceipt(capture, MIN_CONFIDENCE);
        await jest.advanceTimersByTimeAsync(ENHANCE_TIMEOUT_MS);
        const result = await pending;
        finishWarp(lateWarp);
        await jest.runAllTimersAsync();

        // Then the user is not kept waiting, and the warped image nobody will save is freed
        expect(result.image).toBe(capture);
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.TIMED_OUT);
        expect(lateWarpDispose).toHaveBeenCalled();
    });

    it('does not start the warp after the time limit, and reports when the detector lets go of the capture', async () => {
        // Given a detector that only answers after the time limit
        jest.useFakeTimers();
        const capture = createImage(1000, 1000);
        let finishDetect: (document: DetectedDocument) => void = () => {};
        mockDetectInImage.mockReturnValue(
            new Promise<DetectedDocument | undefined>((resolve) => {
                finishDetect = resolve;
            }),
        );

        // When the time limit passes, and the detector then finds the receipt
        const pending = enhanceReceipt(capture, MIN_CONFIDENCE);
        await jest.advanceTimersByTimeAsync(ENHANCE_TIMEOUT_MS);
        const result = await pending;
        let isReleased = false;
        result.sourceReleased.then(() => {
            isReleased = true;
        });
        await Promise.resolve();
        const wasReleasedBeforeDetect = isReleased;
        finishDetect(CENTRED_RECEIPT);
        await jest.runAllTimersAsync();

        // Then nobody waits for a crop that will not be saved, and the capture counts as released only once the detector is done
        expect(result.outcome).toBe(CONST.TELEMETRY.ENHANCE_OUTCOME.TIMED_OUT);
        expect(mockWarpImage).not.toHaveBeenCalled();
        expect(wasReleasedBeforeDetect).toBe(false);
        expect(isReleased).toBe(true);
    });
});
