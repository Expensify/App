import {act, renderHook} from '@testing-library/react-native';

import usePhotoUpgrade from '@pages/iou/request/step/IOURequestStepScan/hooks/usePhotoUpgrade';

import type {Camera, Orientation, PhotoFile} from 'react-native-vision-camera';

const mockReplace = jest.fn<Promise<string>, [string, string, (() => boolean) | undefined]>();
const mockDiscard = jest.fn<Promise<void>, [string]>();
const mockStartUpgrade = jest.fn<void, [string]>();
const mockFinishUpgrade = jest.fn<void, [string]>();
const mockRecordUpgrade = jest.fn<void, [string]>();
const mockWasClaimed = jest.fn<boolean, [string]>();

jest.mock('@libs/ReceiptStorage/receiptUpgrades', () => ({
    start: (name: string) => mockStartUpgrade(name),
    finish: (name: string) => mockFinishUpgrade(name),
    recordUpgrade: (name: string) => mockRecordUpgrade(name),
    isClaimedForRead: (name: string) => mockWasClaimed(name),
}));

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        overwrite: (durableName: string, path: string, shouldAbort?: () => boolean) => mockReplace(durableName, path, shouldAbort),
        discard: (path: string) => mockDiscard(path),
    },
}));

const mockRotate = jest.fn<Promise<string | undefined>, [string, Orientation | undefined]>();

jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright', () => ({
    __esModule: true,
    default: (path: string, orientation?: Orientation) => mockRotate(path, orientation),
}));

jest.mock('react-native-fs', () => ({TemporaryDirectoryPath: '/tmp'}));

const DURABLE_NAME = 'receipt_1234.jpg';
const PHOTO_PATH = '/tmp/still.jpg';
const UPRIGHT_PATH = '/tmp/ImageManipulator/upright.jpg';
const PHOTO_CAPTURE_TIMEOUT_MS = 3000;
const ROTATE_TIMEOUT_MS = 5000;

function buildPhoto(path = PHOTO_PATH): PhotoFile {
    // A portrait capture off a landscape sensor reports `landscape-left`, per VisionCamera's own docs.
    return {path, width: 1920, height: 1440, isRawPhoto: false, orientation: 'landscape-left', isMirrored: false};
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
        landPhoto: async (photo = buildPhoto(), index = 0) => {
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

describe('usePhotoUpgrade', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockReplace.mockResolvedValue(DURABLE_NAME);
        mockDiscard.mockResolvedValue(undefined);
        mockRotate.mockResolvedValue(UPRIGHT_PATH);
        mockWasClaimed.mockReturnValue(false);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('holds the camera session open from the shutter until the photo lands', async () => {
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        expect(result.current.hasPendingPhotoCapture).toBe(false);

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        expect(result.current.hasPendingPhotoCapture).toBe(true);

        await landPhoto();
        expect(result.current.hasPendingPhotoCapture).toBe(false);
    });

    it('swaps the upright photo onto the receipt and cleans up the file it rotated from', async () => {
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        // The hold the photo was taken in decides which way it is turned, so it has to be passed along.
        expect(mockRotate).toHaveBeenCalledWith(PHOTO_PATH, 'landscape-left');
        expect(mockReplace).toHaveBeenCalledWith(DURABLE_NAME, UPRIGHT_PATH, expect.any(Function));
        expect(mockDiscard).toHaveBeenCalledWith(PHOTO_PATH);
        // Only a receipt whose bytes really changed gets a new version, which is what makes a view reload it.
        expect(mockRecordUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
        // The upload waits on this hold, so it has to be let go once the receipt is upgraded.
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
    });

    it('swaps the photo as captured when it needs no rotation, leaving nothing to clean up', async () => {
        mockRotate.mockResolvedValue(undefined);
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        expect(mockReplace).toHaveBeenCalledWith(DURABLE_NAME, PHOTO_PATH, expect.any(Function));
        expect(mockDiscard).not.toHaveBeenCalled();
    });

    it('keeps the snapshot and releases the session when the photo misses the deadline', async () => {
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });

        await act(async () => {
            jest.advanceTimersByTime(PHOTO_CAPTURE_TIMEOUT_MS);
        });

        expect(result.current.hasPendingPhotoCapture).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
        // The file never moved, so nothing that shows it should be told to load it again.
        expect(mockRecordUpgrade).not.toHaveBeenCalled();

        // A photo that turns up after the deadline has no consumer, so it must not stay on disk.
        await landPhoto();
        expect(mockDiscard).toHaveBeenCalledWith(PHOTO_PATH);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('leaves the receipt alone once an upload has claimed it', async () => {
        mockWasClaimed.mockReturnValue(true);
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        // Renaming the file now would change it under the upload that claimed it.
        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockRecordUpgrade).not.toHaveBeenCalled();
        expect(mockDiscard).toHaveBeenCalledWith(PHOTO_PATH);
        expect(mockDiscard).toHaveBeenCalledWith(UPRIGHT_PATH);
    });

    it('keeps the snapshot when the rotate never settles, rather than holding the upgrade open', async () => {
        mockRotate.mockReturnValue(new Promise<string>(() => {}));
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        expect(mockFinishUpgrade).not.toHaveBeenCalled();

        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        // Left registered, `isUpgrading` would stay true for the rest of the launch.
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('deletes a rotated copy that lands after the rotate deadline, which nothing else would claim', async () => {
        let landRotate: (path: string) => void = () => {};
        mockRotate.mockReturnValue(
            new Promise<string>((resolve) => {
                landRotate = resolve;
            }),
        );
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        // The rotate misses its cap, so the swap gives up and keeps the snapshot.
        await act(async () => {
            jest.advanceTimersByTime(ROTATE_TIMEOUT_MS);
        });
        expect(mockReplace).not.toHaveBeenCalled();

        // The manipulator still finishes and writes its JPEG, with nothing left pointing at it.
        await act(async () => {
            landRotate(UPRIGHT_PATH);
        });

        expect(mockDiscard).toHaveBeenCalledWith(UPRIGHT_PATH);
    });

    it('hands the swap a guard that still reports a claim made after the swap began', async () => {
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        const firstSwap = mockReplace.mock.calls.at(0);
        expect(firstSwap).toBeDefined();
        const shouldAbort = firstSwap?.[2];
        expect(shouldAbort?.()).toBe(false);

        // The swap yields several times before it renames anything, so a reader can give up in between.
        mockWasClaimed.mockReturnValue(true);
        expect(shouldAbort?.()).toBe(true);
    });

    it('records a swap that backed out for an upload as claimed rather than failed', async () => {
        mockReplace.mockRejectedValue(new Error('a reader stopped waiting'));
        mockWasClaimed.mockReturnValue(false);
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });

        // Decided while the swap was running, which is the case the in-swap guard exists for.
        mockWasClaimed.mockReturnValue(true);
        await landPhoto();

        expect(mockRecordUpgrade).not.toHaveBeenCalled();
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
    });

    it('deletes the rotated copy when the swap fails, so failed upgrades do not pile up', async () => {
        mockReplace.mockRejectedValue(new Error('no space left on device'));
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto();

        expect(mockDiscard).toHaveBeenCalledWith(UPRIGHT_PATH);
        expect(mockRecordUpgrade).not.toHaveBeenCalled();
    });

    it('keeps the snapshot when the capture itself fails', async () => {
        const {camera, failCapture} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await failCapture();

        expect(result.current.hasPendingPhotoCapture).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockDiscard).not.toHaveBeenCalled();
        // A capture that failed must not leave the upload waiting on it.
        expect(mockFinishUpgrade).toHaveBeenCalledWith(DURABLE_NAME);
    });

    it('deletes the photo when the receipt it was meant for never arrived', async () => {
        const {camera, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.discardPendingPhoto();
        });
        await landPhoto();

        expect(mockReplace).not.toHaveBeenCalled();
        expect(mockDiscard).toHaveBeenCalledWith(PHOTO_PATH);
    });

    it('deletes the photo of a capture the next shutter replaced before it was claimed', async () => {
        const {camera, takePhoto, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        // Two shutters, and the first was never handed a receipt — so nothing else will clean up after it.
        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.startPhotoCapture(camera);
        });

        // The second shutter replaces the first capture without starting one of its own, since the camera
        // is still busy with it.
        expect(takePhoto).toHaveBeenCalledTimes(1);

        // The abandoned photo still lands, and is still deleted, even though nothing replaced it.
        await landPhoto(buildPhoto('/tmp/orphaned.jpg'), 0);
        expect(mockDiscard).toHaveBeenCalledWith('/tmp/orphaned.jpg');
        expect(mockRotate).not.toHaveBeenCalled();
    });

    it('deletes an unclaimed photo when the scan screen goes away', async () => {
        const {camera, landPhoto} = buildCamera();
        const {result, unmount} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        unmount();

        await landPhoto();
        expect(mockDiscard).toHaveBeenCalledWith(PHOTO_PATH);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('does not start a second photo over one the camera is still taking, since the next snapshot pays for it', async () => {
        const {camera, takePhoto, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });

        // The user came back to the camera and shot again before the first photo landed. Starting a
        // second capture here is what made a later `takeSnapshot` take seconds on device.
        act(() => {
            result.current.startPhotoCapture(camera);
        });
        expect(takePhoto).toHaveBeenCalledTimes(1);

        // The receipt this shutter produced keeps its snapshot rather than waiting on a contended camera.
        act(() => {
            result.current.upgradeReceiptWithPhoto('receipt_5678.jpg');
        });
        expect(mockStartUpgrade).not.toHaveBeenCalledWith('receipt_5678.jpg');

        await landPhoto(buildPhoto(), 0);
    });

    it('takes a photo again once the camera has finished the previous one', async () => {
        const {camera, takePhoto, landPhoto} = buildCamera();
        const {result} = renderHook(() => usePhotoUpgrade());

        act(() => {
            result.current.startPhotoCapture(camera);
        });
        act(() => {
            result.current.upgradeReceiptWithPhoto(DURABLE_NAME);
        });
        await landPhoto(buildPhoto(), 0);

        // The camera is free, so the guard lets the next shutter upgrade as normal.
        act(() => {
            result.current.startPhotoCapture(camera);
        });
        expect(takePhoto).toHaveBeenCalledTimes(2);
    });
});
