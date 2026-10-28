import {act, render} from '@testing-library/react-native';

import Camera from '@pages/iou/request/step/IOURequestStepScan/components/Camera/index.native';

import React from 'react';
import {Alert} from 'react-native';

let mockIsFocused = true;
let mockCapturePhoto: (() => void) | undefined;
let mockResolveCapture: (photo: unknown) => void = () => {};
let mockRejectCapture: (error: unknown) => void = () => {};

jest.mock('@hooks/useNativeCamera', () => ({
    __esModule: true,
    default: () => ({
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
    }),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useNavigation: () => ({isFocused: () => mockIsFocused}),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/captureReceipt', () => ({
    __esModule: true,
    default: () =>
        new Promise((resolve, reject) => {
            mockResolveCapture = resolve;
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

jest.mock('@pages/iou/request/step/IOURequestStepScan/utils/startReceiptPrepareSpan', () => ({__esModule: true, default: jest.fn()}));

let mockAdopt: () => Promise<string> = () => Promise.resolve('receipt.jpg');
jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: () => mockAdopt(),
        toLocalUri: (durableName: string) => `file:///receipts/${durableName}`,
    },
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/useCameraInitTelemetry', () => ({
    __esModule: true,
    default: () => ({handleCameraConfigured: jest.fn(), handleSessionConfigSelected: jest.fn()}),
}));

jest.mock('@hooks/useReceiptPhotoOutput', () => ({__esModule: true, default: () => ({photoOutput: {}, cameraAspectRatio: undefined, updatePhotoResolution: jest.fn()})}));

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
}

function pressShutter() {
    act(() => {
        mockCapturePhoto?.();
    });
}

async function failCapture(error: unknown = CAMERA_CLOSED_ERROR) {
    await act(async () => {
        mockRejectCapture(error);
    });
}

async function finishCapture() {
    await act(async () => {
        mockResolveCapture({path: '/tmp/photo.jpg', width: 1512, height: 2016});
    });
}

describe('Scan camera capture cancelled by leaving the screen', () => {
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsFocused = true;
        mockCapturePhoto = undefined;
        mockAdopt = () => Promise.resolve('receipt.jpg');
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
        mockIsFocused = false;
        await failCapture();

        // Then no alert appears on the screen the user went to, and the expected cancellation is logged as info, not as a warning
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogInfo).toHaveBeenCalledWith('Photo capture cancelled by leaving the screen', false, {error: CAMERA_CLOSED_ERROR.message});
        expect(mockLogWarn).not.toHaveBeenCalled();
    });

    it('still shows the camera error alert when the capture fails while the user is on the scan screen', async () => {
        // Given a capture is in progress on the focused scan screen
        renderFocusedCamera();
        pressShutter();

        // When the capture fails while the user is still there
        await failCapture();

        // Then the user is told the camera failed, and the failure is logged as a warning, as before
        expect(alertSpy).toHaveBeenCalledWith('receipt.cameraErrorTitle', 'receipt.cameraErrorMessage');
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', expect.objectContaining({message: CAMERA_CLOSED_ERROR.message}));
    });

    it('still logs a warning, without an alert, when the camera fails for another reason after the user left the scan screen', async () => {
        // Given a capture is still in progress on the focused scan screen
        renderFocusedCamera();
        pressShutter();

        // When the user leaves the screen and the capture fails with an error that is not the camera closing
        mockIsFocused = false;
        const writeError = Object.assign(new Error('Failed to write the photo to disk'), {code: 'capture/file-io-error'});
        await failCapture(writeError);

        // Then no alert appears on the screen the user went to, but the failure stays a warning because it is a real camera error, not a cancellation
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', expect.objectContaining({message: writeError.message}));
        expect(mockLogInfo).not.toHaveBeenCalledWith('Photo capture cancelled by leaving the screen', expect.anything(), expect.anything());
    });

    it('still logs a warning, without an alert, when saving the photo fails after the user left the scan screen', async () => {
        // Given a capture is still in progress on the focused scan screen, and saving the photo will fail
        const saveError = new Error('Could not move the photo into the receipts folder');
        mockAdopt = () => Promise.reject(saveError);
        renderFocusedCamera();
        pressShutter();

        // When the user leaves the screen and the photo is taken but fails to save
        mockIsFocused = false;
        await finishCapture();

        // Then no alert appears on the screen the user went to, but this is a real storage failure, so it stays a warning instead of being logged as a cancellation
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', expect.objectContaining({message: saveError.message}));
        expect(mockLogInfo).not.toHaveBeenCalledWith('Photo capture cancelled by leaving the screen', expect.anything(), expect.anything());
    });
});
