import {act, renderHook} from '@testing-library/react-native';

import type CapturedPhoto from '@libs/cameraCapture/types';
import type {TransformImage} from '@libs/cameraCapture/types';

import usePhotoUpgrade from '@pages/iou/request/step/IOURequestStepScan/hooks/usePhotoUpgrade';

import type {CameraPhotoOutput} from 'react-native-vision-camera';

const mockCapturePhotoToPath = jest.fn<Promise<CapturedPhoto>, unknown[]>();
const mockOverwrite = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
const mockDiscard = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
const mockRotatePhotoToUpright = jest.fn<Promise<string | undefined>, unknown[]>(() => Promise.resolve(undefined));

jest.mock('@libs/cameraCapture', () => ({
    capturePhotoToPath: (...args: unknown[]) => mockCapturePhotoToPath(...args),
}));

jest.mock('@libs/ReceiptStorage', () => ({
    overwrite: (...args: unknown[]) => mockOverwrite(...args),
    discard: (...args: unknown[]) => mockDiscard(...args),
}));

jest.mock(
    '@pages/iou/request/step/IOURequestStepScan/utils/rotatePhotoToUpright',
    () =>
        (...args: unknown[]) =>
            mockRotatePhotoToUpright(...args),
);

jest.mock('@libs/getReceiptsUploadFolderPath', () => () => '/receipts');

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The capture is mocked, so the photo output is never read
const photoOutput = {} as CameraPhotoOutput;
const transformImage: TransformImage = (image) => Promise.resolve({image, sourceReleased: Promise.resolve()});

async function upgradeWith(photo: CapturedPhoto, isSnapshotTransformed: boolean) {
    mockCapturePhotoToPath.mockResolvedValue(photo);
    const {result} = renderHook(() => usePhotoUpgrade());
    act(() => {
        result.current.startPhotoCapture(photoOutput, transformImage);
    });
    await act(async () => {
        result.current.upgradeReceiptWithPhoto('receipt_1.jpg', isSnapshotTransformed);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
    });
}

describe('usePhotoUpgrade', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('swaps in the full-resolution photo when it was cropped like the snapshot', async () => {
        // Given a cropped snapshot and a full-resolution photo the crop also found the receipt in
        const photo: CapturedPhoto = {path: '/receipts/photo.jpg', width: 2016, height: 2688, isTransformed: true};

        // When the receipt is upgraded
        await upgradeWith(photo, true);

        // Then the sharper photo replaces the snapshot, without a rotation pass, since it was decoded upright in memory
        expect(mockOverwrite).toHaveBeenCalledWith('receipt_1.jpg', '/receipts/photo.jpg', expect.any(Function));
        expect(mockRotatePhotoToUpright).not.toHaveBeenCalled();
    });

    it('keeps the cropped snapshot when the full-resolution photo could not be cropped', async () => {
        // Given a cropped snapshot, and a photo taken a moment later in which the crop found no receipt
        const photo: CapturedPhoto = {path: '/receipts/photo.jpg', width: 3024, height: 4032, isTransformed: false};

        // When the receipt is upgraded
        await upgradeWith(photo, true);

        // Then the snapshot stays, so the receipt the user saw cropped never turns back into the whole frame
        expect(mockOverwrite).not.toHaveBeenCalled();
        expect(mockDiscard).toHaveBeenCalledWith('/receipts/photo.jpg');
    });

    it('swaps in the uncropped photo when the snapshot was not cropped either', async () => {
        // Given a snapshot and a photo in which no receipt was found
        const photo: CapturedPhoto = {path: '/receipts/photo.jpg', width: 3024, height: 4032, isTransformed: false};

        // When the receipt is upgraded
        await upgradeWith(photo, false);

        // Then the sharper photo still replaces the snapshot, as without enhancement
        expect(mockOverwrite).toHaveBeenCalledWith('receipt_1.jpg', '/receipts/photo.jpg', expect.any(Function));
    });

    it('waits for a photo that arrived in time but is still being cropped when the capture deadline passes', async () => {
        // Given a photo the camera takes at once, but whose decode, crop and save finish only after the capture deadline,
        // as when the confirmation page keeps the JS thread busy
        jest.useFakeTimers();
        const photo: CapturedPhoto = {path: '/receipts/photo.jpg', width: 2016, height: 2688, isTransformed: true};
        let finishSave: () => void = () => {};
        mockCapturePhotoToPath.mockImplementation((...args: unknown[]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The mock reads the callbacks argument the capture passes
            const callbacks = args.at(3) as {onDidCapturePhoto?: () => void};
            callbacks.onDidCapturePhoto?.();
            return new Promise<CapturedPhoto>((resolve) => {
                finishSave = () => resolve(photo);
            });
        });
        const {result} = renderHook(() => usePhotoUpgrade());
        act(() => {
            result.current.startPhotoCapture(photoOutput, transformImage);
        });

        // When the deadline passes, and the cropped photo is saved afterwards
        await act(async () => {
            result.current.upgradeReceiptWithPhoto('receipt_1.jpg', true);
            await jest.advanceTimersByTimeAsync(10000);
            finishSave();
            await jest.runAllTimersAsync();
        });
        jest.useRealTimers();

        // Then the cropped photo still replaces the snapshot, since the deadline only guards against a camera that never answers
        expect(mockOverwrite).toHaveBeenCalledWith('receipt_1.jpg', '/receipts/photo.jpg', expect.any(Function));
        expect(mockDiscard).not.toHaveBeenCalled();
    });

    it('saves the transformed photo into the receipts folder', async () => {
        // Given a full-resolution capture started with a transform
        const photo: CapturedPhoto = {path: '/receipts/photo.jpg', width: 2016, height: 2688, isTransformed: true};

        // When the receipt is upgraded
        await upgradeWith(photo, true);

        // Then the capture gets a path to save the transform's result to, and the transform itself
        const [, , path, , transform] = mockCapturePhotoToPath.mock.calls.at(0) ?? [];
        expect(path).toEqual(expect.stringMatching(/^\/receipts\/receipt_\d+_\d+\.jpg$/));
        expect(transform).toBe(transformImage);
    });
});
