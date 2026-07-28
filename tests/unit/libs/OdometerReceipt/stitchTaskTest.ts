import stitchTask from '@libs/OdometerReceipt/stitchTask';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

const mockStitchOdometerImages = jest.fn<Promise<FileObject | null>, [FileObject | string | undefined, FileObject | string | undefined]>();
jest.mock('@libs/stitchOdometerImages', () => ({
    __esModule: true,
    default: (...args: Parameters<typeof mockStitchOdometerImages>) => mockStitchOdometerImages(...args),
}));

const mockStartSpan = jest.fn<void, unknown[]>();
const mockEndSpan = jest.fn<void, unknown[]>();
const mockCancelSpan = jest.fn<void, unknown[]>();
jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: (...args: unknown[]) => mockStartSpan(...args),
    endSpan: (...args: unknown[]) => mockEndSpan(...args),
    cancelSpan: (...args: unknown[]) => mockCancelSpan(...args),
}));

const SPAN_ID = CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH;
const sampleStart: FileObject = {uri: 'blob:start', name: 'start.jpg', type: 'image/jpeg'};
const sampleEnd: FileObject = {uri: 'blob:end', name: 'end.jpg', type: 'image/jpeg'};
const sampleStitched: FileObject = {uri: 'blob:stitched', name: 'stitched.jpg', type: 'image/jpeg'};

describe('stitchTask', () => {
    beforeEach(() => {
        mockStitchOdometerImages.mockReset();
        mockStartSpan.mockReset();
        mockEndSpan.mockReset();
        mockCancelSpan.mockReset();
    });

    it('resolves with {uri, name, type} on success and balances start/end (no cancel)', async () => {
        mockStitchOdometerImages.mockResolvedValueOnce(sampleStitched);

        const result = await stitchTask({startImage: sampleStart, endImage: sampleEnd, signal: new AbortController().signal});

        expect(result).toEqual({uri: 'blob:stitched', name: 'stitched.jpg', type: 'image/jpeg'});
        expect(mockStartSpan).toHaveBeenCalledTimes(1);
        expect(mockStartSpan).toHaveBeenCalledWith(SPAN_ID, {name: SPAN_ID, op: SPAN_ID});
        expect(mockEndSpan).toHaveBeenCalledTimes(1);
        expect(mockEndSpan).toHaveBeenCalledWith(SPAN_ID);
        expect(mockCancelSpan).not.toHaveBeenCalled();
    });

    it('operates without a signal (signal is optional)', async () => {
        mockStitchOdometerImages.mockResolvedValueOnce(sampleStitched);

        const result = await stitchTask({startImage: sampleStart, endImage: sampleEnd});

        expect(result.uri).toBe('blob:stitched');
        expect(mockEndSpan).toHaveBeenCalledTimes(1);
        expect(mockCancelSpan).not.toHaveBeenCalled();
    });

    it('rejects and cancels the span when stitchOdometerImages itself rejects', async () => {
        mockStitchOdometerImages.mockRejectedValueOnce(new Error('canvas failure'));

        await expect(stitchTask({startImage: sampleStart, endImage: sampleEnd, signal: new AbortController().signal})).rejects.toThrow('canvas failure');
        expect(mockStartSpan).toHaveBeenCalledTimes(1);
        expect(mockCancelSpan).toHaveBeenCalledTimes(1);
        expect(mockCancelSpan).toHaveBeenCalledWith(SPAN_ID);
        expect(mockEndSpan).not.toHaveBeenCalled();
    });

    it('rejects and cancels the span when stitchOdometerImages returns null', async () => {
        mockStitchOdometerImages.mockResolvedValueOnce(null);

        await expect(stitchTask({startImage: sampleStart, endImage: sampleEnd, signal: new AbortController().signal})).rejects.toThrow();
        expect(mockCancelSpan).toHaveBeenCalledTimes(1);
        expect(mockEndSpan).not.toHaveBeenCalled();
    });

    it('rejects and cancels the span when signal is already aborted before the call (does not invoke stitchOdometerImages)', async () => {
        const controller = new AbortController();
        controller.abort();

        await expect(stitchTask({startImage: sampleStart, endImage: sampleEnd, signal: controller.signal})).rejects.toThrow();
        expect(mockStartSpan).toHaveBeenCalledTimes(1);
        expect(mockCancelSpan).toHaveBeenCalledTimes(1);
        expect(mockEndSpan).not.toHaveBeenCalled();
        expect(mockStitchOdometerImages).not.toHaveBeenCalled();
    });

    it('rejects and cancels the span when the signal is aborted while the stitch is in flight', async () => {
        const controller = new AbortController();
        let resolveStitch: ((value: FileObject) => void) | undefined;
        mockStitchOdometerImages.mockReturnValueOnce(
            new Promise<FileObject>((resolve) => {
                resolveStitch = resolve;
            }),
        );

        const promise = stitchTask({startImage: sampleStart, endImage: sampleEnd, signal: controller.signal});
        controller.abort();
        resolveStitch?.(sampleStitched);

        await expect(promise).rejects.toThrow();
        expect(mockCancelSpan).toHaveBeenCalledTimes(1);
        expect(mockEndSpan).not.toHaveBeenCalled();
    });
});
