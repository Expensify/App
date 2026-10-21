import type CapturedPhoto from '@libs/cameraCapture/types';

import captureReceiptIOS from '@pages/iou/request/step/IOURequestStepScan/captureReceipt/index.ios';
import type {CaptureReceipt} from '@pages/iou/request/step/IOURequestStepScan/captureReceipt/types';

import type {CameraPhotoOutput, CameraRef} from 'react-native-vision-camera';

const mockCapturePhotoToPath = jest.fn<Promise<CapturedPhoto>, unknown[]>(() => Promise.resolve({path: '/receipts/receipt.jpg', width: 1944, height: 2592}));
const mockCaptureSnapshotToPath = jest.fn<Promise<CapturedPhoto>, unknown[]>(() => Promise.resolve({path: '/receipts/receipt.jpg', width: 1080, height: 1440}));

jest.mock('@libs/cameraCapture', () => ({
    capturePhotoToPath: (...args: unknown[]) => mockCapturePhotoToPath(...args),
    captureSnapshotToPath: (...args: unknown[]) => mockCaptureSnapshotToPath(...args),
}));

// Jest resolves the bare path to index.ios.ts, so the Android implementation is loaded by its file name.
const captureReceiptAndroid = jest.requireActual<{default: CaptureReceipt}>('@pages/iou/request/step/IOURequestStepScan/captureReceipt/index.ts').default;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const camera = {} as CameraRef;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const photoOutput = {} as CameraPhotoOutput;
const BASE_OPTIONS = {flash: false, hasFlash: true, isPlatformMuted: false, isInLandscapeMode: false, path: '/receipts'};

function getSettings() {
    return mockCapturePhotoToPath.mock.calls.at(-1)?.at(1);
}

describe('captureReceipt', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('on iOS', () => {
        it('takes a silent photo for a plain portrait scan, like the v4 snapshot it replaces', () => {
            // Given a portrait scan without flash, which was a silent snapshot on VisionCamera v4
            // When the receipt is captured
            captureReceiptIOS(camera, photoOutput, BASE_OPTIONS);

            // Then it is a full photo with no shutter sound
            expect(mockCaptureSnapshotToPath).not.toHaveBeenCalled();
            expect(getSettings()).toEqual({flashMode: 'off', enableShutterSound: false});
        });

        it('plays the shutter sound for flash and landscape photos unless the phone is muted', () => {
            // Given the flash and landscape captures, which were sounding photos on v4 as well
            // When each is captured, unmuted and then muted
            captureReceiptIOS(camera, photoOutput, {...BASE_OPTIONS, flash: true});
            const flashSettings = getSettings();
            captureReceiptIOS(camera, photoOutput, {...BASE_OPTIONS, isInLandscapeMode: true});
            const landscapeSettings = getSettings();
            captureReceiptIOS(camera, photoOutput, {...BASE_OPTIONS, flash: true, isPlatformMuted: true});
            const mutedSettings = getSettings();

            // Then the sound follows the mute switch, as v4's takePhoto did
            expect(flashSettings).toEqual({flashMode: 'on', enableShutterSound: true});
            expect(landscapeSettings).toEqual({flashMode: 'off', enableShutterSound: true});
            expect(mutedSettings).toEqual({flashMode: 'on', enableShutterSound: false});
        });
    });

    describe('blink timing', () => {
        it('hands the capture callback to full photos so the blink matches the real shutter moment', () => {
            // Given a flash capture, which meters the flash before the photo is actually taken
            const onWillCapturePhoto = jest.fn();

            // When the receipt is captured on iOS and on Android
            captureReceiptIOS(camera, photoOutput, {...BASE_OPTIONS, flash: true, onWillCapturePhoto});
            const iosCallbacks = mockCapturePhotoToPath.mock.calls.at(-1)?.at(3);
            captureReceiptAndroid(camera, photoOutput, {...BASE_OPTIONS, flash: true, onWillCapturePhoto});
            const androidCallbacks = mockCapturePhotoToPath.mock.calls.at(-1)?.at(3);

            // Then both photos report the moment they are taken, so the blink can wait for it instead of firing on the tap
            expect(iosCallbacks).toEqual({onWillCapturePhoto});
            expect(androidCallbacks).toEqual({onWillCapturePhoto});
        });
    });

    describe('on Android', () => {
        it('keeps the preview snapshot for a plain portrait scan', () => {
            // Given a portrait scan without flash, where a full photo is slow on many Android cameras
            // When the receipt is captured
            captureReceiptAndroid(camera, photoOutput, BASE_OPTIONS);

            // Then the fast snapshot is used, written into the receipts folder
            expect(mockCapturePhotoToPath).not.toHaveBeenCalled();
            expect(mockCaptureSnapshotToPath).toHaveBeenCalledWith(camera, expect.stringMatching(/^\/receipts\/receipt_\d+_\d+\.jpg$/));
        });
    });
});
