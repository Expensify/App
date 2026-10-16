import {act, render} from '@testing-library/react-native';

import Camera from '@pages/iou/request/step/IOURequestStepScan/components/Camera/index.native';

import React from 'react';
import {Alert} from 'react-native';

type FocusCallbacks = {onFocusStart?: () => void; onFocusCleanup?: () => void};

let mockFocusCallbacks: FocusCallbacks = {};
const mockIsScreenFocused = {current: false};
let mockCapturePhoto: (() => void) | undefined;
let mockRejectCapture: (error: unknown) => void = () => {};

jest.mock('@hooks/useNativeCamera', () => ({
    __esModule: true,
    default: (options: FocusCallbacks) => {
        mockFocusCallbacks = {
            onFocusStart: () => {
                mockIsScreenFocused.current = true;
                options.onFocusStart?.();
            },
            onFocusCleanup: () => {
                mockIsScreenFocused.current = false;
                options.onFocusCleanup?.();
            },
        };
        return {
            isScreenFocused: mockIsScreenFocused,
            camera: {current: {}},
            device: {id: 'back', hasFlash: true},
            cameraPermissionStatus: 'granted',
            flash: true,
            setFlash: jest.fn(),
            hasFlash: true,
            didCapturePhoto: false,
            setDidCapturePhoto: jest.fn(),
            isAttachmentPickerActive: false,
            setIsAttachmentPickerActive: jest.fn(),
            isPlatformMuted: false,
            askForPermissions: jest.fn(),
            tapGesture: {},
            cameraFocusIndicatorAnimatedStyle: {},
        };
    },
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/captureReceipt', () => ({
    __esModule: true,
    default: () =>
        new Promise((_resolve, reject) => {
            mockRejectCapture = reject;
        }),
    shouldTakePhoto: () => true,
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/components/ScannerControlsBar', () => ({
    __esModule: true,
    default: ({capturePhoto}: {capturePhoto: () => void}) => {
        mockCapturePhoto = capturePhoto;
        return null;
    },
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/components/CameraViewport', () => () => null);
jest.mock('@pages/iou/request/step/IOURequestStepScan/components/CameraPermissionPrompt', () => () => null);
jest.mock('@pages/iou/request/step/IOURequestStepScan/components/ReceiptPreviews', () => () => null);
jest.mock('@pages/iou/request/step/IOURequestStepScan/components/MultiScanEducationalModal', () => () => null);

jest.mock('@pages/iou/request/step/IOURequestStepScan/components/MultiScanContext', () => ({
    useMultiScanState: () => ({isMultiScanEnabled: false, canUseMultiScan: false}),
    useMultiScanActions: () => ({toggleMultiScan: jest.fn()}),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/usePhotoUpgrade', () => ({
    __esModule: true,
    default: () => ({hasPendingPhotoCapture: false, startPhotoCapture: jest.fn(), upgradeReceiptWithPhoto: jest.fn(), discardPendingPhoto: jest.fn()}),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/useCameraInitTelemetry', () => ({
    __esModule: true,
    default: () => ({handleCameraInitialized: jest.fn()}),
}));

jest.mock('react-native-vision-camera', () => ({useCameraFormat: () => undefined}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useIsInLandscapeMode', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useWindowDimensions', () => ({__esModule: true, default: () => ({windowWidth: 390, windowHeight: 844})}));
jest.mock('@libs/getReceiptsUploadFolderPath', () => ({__esModule: true, default: () => '/receipts'}));
jest.mock('@libs/HapticFeedback', () => ({__esModule: true, default: {press: jest.fn()}}));
jest.mock('@libs/telemetry/activeSpans', () => ({
    cancelSpan: jest.fn(),
    endSpanWithAttributes: jest.fn(),
    getSpan: jest.fn(),
    startSpan: jest.fn(),
}));

const mockLogInfo = jest.fn<void, unknown[]>();
const mockLogWarn = jest.fn<void, unknown[]>();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        info: (...args: unknown[]) => mockLogInfo(...args),
        warn: (...args: unknown[]) => mockLogWarn(...args),
        hmmm: jest.fn(),
        alert: jest.fn(),
    },
}));

const CAMERA_CLOSED_ERROR = new Error('androidx.camera.core.ImageCaptureException: Camera is closed.');

function renderFocusedCamera() {
    render(
        <Camera
            onCapture={jest.fn()}
            onPicked={jest.fn()}
        />,
    );
    act(() => {
        mockFocusCallbacks.onFocusStart?.();
    });
}

function pressShutter() {
    act(() => {
        mockCapturePhoto?.();
    });
}

async function failCapture() {
    await act(async () => {
        mockRejectCapture(CAMERA_CLOSED_ERROR);
    });
}

describe('Scan camera capture cancelled by leaving the screen', () => {
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFocusCallbacks = {};
        mockIsScreenFocused.current = false;
        mockCapturePhoto = undefined;
        alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        alertSpy.mockRestore();
    });

    it('does not show the camera error alert when the capture fails after the user left the scan screen', async () => {
        // Given a flash capture is still in progress on the focused scan screen
        renderFocusedCamera();
        pressShutter();

        // When the user leaves the screen and the camera closing cancels that capture
        act(() => {
            mockFocusCallbacks.onFocusCleanup?.();
        });
        await failCapture();

        // Then no alert appears on the screen the user went to, but the failure is still logged so real errors stay visible
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', CAMERA_CLOSED_ERROR);
    });

    it('still shows the camera error alert when the capture fails while the user is on the scan screen', async () => {
        // Given a capture is in progress on the focused scan screen
        renderFocusedCamera();
        pressShutter();

        // When the capture fails while the user is still there
        await failCapture();

        // Then the user is told the camera failed, as before
        expect(alertSpy).toHaveBeenCalledWith('receipt.cameraErrorTitle', 'receipt.cameraErrorMessage');
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', CAMERA_CLOSED_ERROR);
    });
});
