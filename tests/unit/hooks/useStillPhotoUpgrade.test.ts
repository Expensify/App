import {act, renderHook} from '@testing-library/react-native';

import useStillPhotoUpgrade from '@pages/iou/request/step/IOURequestStepScan/hooks/useStillPhotoUpgrade';

import type {Camera, PhotoFile} from 'react-native-vision-camera';

const mockReplace = jest.fn<Promise<string>, [string, string]>();
const mockDiscard = jest.fn<Promise<void>, [string]>();
const mockStartUpgrade = jest.fn<void, [string]>();
const mockFinishUpgrade = jest.fn<void, [string]>();

jest.mock('@libs/ReceiptStorage/receiptUpgrades', () => ({
    start: (name: string) => mockStartUpgrade(name),
    finish: (name: string) => mockFinishUpgrade(name),
}));

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        overwrite: (durableName: string, path: string) => mockReplace(durableName, path),
        discard: (path: string) => mockDiscard(path),
    },
}));

const mockRotate = jest.fn<Promise<string | undefined>, [string]>();

jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/rotateStillToUpright', () => ({
    __esModule: true,
    default: (path: string) => mockRotate(path),
}));

jest.mock('react-native-fs', () => ({TemporaryDirectoryPath: '/tmp'}));

const DURABLE_NAME = 'receipt_1234.jpg';
const STILL_PATH = '/tmp/still.jpg';
const UPRIGHT_PATH = '/tmp/ImageManipulator/upright.jpg';
const STILL_CAPTURE_TIMEOUT_MS = 3000;

function buildStill(path = STILL_PATH): PhotoFile {
    return {path, width: 1920, height: 1440, isRawPhoto: false, orientation: 'portrait', isMirrored: false};
}

/** A camera whose captures the test resolves or rejects on demand, in the order they were started. */
function buildCamera() {
    const started: Array<{resolve: (photo: PhotoFile) => void; reject: (error: Error) => void}> = [];
    const takePhoto = jest.fn(
        () =>
            new Promise<PhotoFile>((resolve, reject) => {
                started.push({resolve, reject});
            }),
    );

    return {
        // The hook only ever calls `takePhoto`, so a stub of the one method is all the test needs.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        camera: {takePhoto} as unknown as Camera,
        takePhoto,
        landStill: async (photo = buildStill(), index = 0) => {
            await act(async () => {
                started.at(index)?.resolve(photo);
            });
        },
        failCapture: async (index = 0) => {
            await act(async () => {
                started.at(index)?.reject(new Error('Camera is closed.'));
            });
        },
    };
}

describe('useStillPhotoUpgrade', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockReplace.mockResolvedValue(DURABLE_NAME);
        mockDiscard.mockResolvedValue(undefined);
        mockRotate.mockResolvedValue(UPRIGHT_PATH);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('holds the camera session open from the shutter until the still lands', async () => {
        const {camera, landStill} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        expect(result.current.hasPendingStillCapture).toBe(false);

        act(() => {
            result.current.captureStill(camera);
        });
        expect(result.current.hasPendingStillCapture).toBe(true);

        await landStill();
        expect(result.current.hasPendingStillCapture).toBe(false);
    });

    it('swaps the upright still onto the receipt and cleans up the file it rotated from', async () => {
        const {camera, landStill} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        act(() => {
            result.current.captureStill(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithStill(DURABLE_NAME);
        });
        await landStill();

        expect(mockRotate).toHaveBeenCalledWith(STILL_PATH);
        expect(mockReplace).toHaveBeenCalledWith(DURABLE_NAME, UPRIGHT_PATH);
        expect(mockDiscard).toHaveBeenCalledWith(STILL_PATH);
        // The upload waits on this hold, so it has to be let go once the receipt is upgraded.
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
    });

    it('swaps the still as captured when it needs no rotation, leaving nothing to clean up', async () => {
        mockRotate.mockResolvedValue(undefined);
        const {camera, landStill} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        act(() => {
            result.current.captureStill(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithStill(DURABLE_NAME);
        });
        await landStill();

        expect(mockReplace).toHaveBeenCalledWith(DURABLE_NAME, STILL_PATH);
        expect(mockDiscard).not.toHaveBeenCalled();
    });

    it('keeps the snapshot and releases the session when the still misses the deadline', async () => {
        const {camera, landStill} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        act(() => {
            result.current.captureStill(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithStill(DURABLE_NAME);
        });

        await act(async () => {
            jest.advanceTimersByTime(STILL_CAPTURE_TIMEOUT_MS);
        });

        expect(result.current.hasPendingStillCapture).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);

        // A still that turns up after the deadline has no consumer, so it must not stay on disk.
        await landStill();
        expect(mockDiscard).toHaveBeenCalledWith(STILL_PATH);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('keeps the snapshot when the capture itself fails', async () => {
        const {camera, failCapture} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        act(() => {
            result.current.captureStill(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithStill(DURABLE_NAME);
        });
        await failCapture();

        expect(result.current.hasPendingStillCapture).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockDiscard).not.toHaveBeenCalled();
        // A capture that failed must not leave the upload waiting on it.
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
    });

    it('deletes the still when the receipt it was meant for never arrived', async () => {
        const {camera, landStill} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        act(() => {
            result.current.captureStill(camera);
        });
        act(() => {
            result.current.discardPendingStill();
        });
        await landStill();

        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockDiscard).toHaveBeenCalledWith(STILL_PATH);
    });

    it('keeps the session open for a retake when the first still settles after it started', async () => {
        const {camera, takePhoto, landStill} = buildCamera();
        const {result} = renderHook(() => useStillPhotoUpgrade());

        act(() => {
            result.current.captureStill(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithStill(DURABLE_NAME);
        });

        // The user came back to the camera and shot again before the first still landed.
        act(() => {
            result.current.captureStill(camera);
        });
        expect(takePhoto).toHaveBeenCalledTimes(2);

        await landStill(buildStill(), 0);
        expect(result.current.hasPendingStillCapture).toBe(true);

        await landStill(buildStill('/tmp/still2.jpg'), 1);
        expect(result.current.hasPendingStillCapture).toBe(false);
    });
});
