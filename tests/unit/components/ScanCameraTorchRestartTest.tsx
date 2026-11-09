import {act, render} from '@testing-library/react-native';

import Camera from '@pages/iou/request/step/IOURequestStepScan/components/Camera/index.native';

import React from 'react';

let mockFlash = true;
let mockTorchMode: 'on' | 'off' = 'on';
const mockSetTorchMode = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
let mockCapturePhoto: (() => void) | undefined;
let mockViewportProps: {onStarted?: () => void; isTorchOn?: boolean} = {};
type CaptureOptions = {isTorchOn?: boolean};
const mockCaptureReceipt = jest.fn<Promise<unknown>, [unknown, unknown, CaptureOptions]>(() => new Promise(() => {}));

jest.mock('@hooks/useNativeCamera', () => ({
    __esModule: true,
    default: () => ({
        camera: {
            current: {
                controller: {
                    get torchMode() {
                        return mockTorchMode;
                    },
                    setTorchMode: (...args: unknown[]) => mockSetTorchMode(...args),
                },
            },
        },
        device: {id: 'back', hasFlash: true, hasTorch: true},
        cameraPermissionStatus: 'granted',
        flash: mockFlash,
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

jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: () => ({isBetaEnabled: () => true})}));

// Jest resolves the camera platform config to the iOS file, which has no torch path.
jest.mock('@libs/cameraCapture/platformConfig', () => ({
    __esModule: true,
    default: {scanQualityPrioritization: 'balanced', preparedPhotoSettings: undefined, shouldHidePreviewUntilLive: false, reportsAutoFocusSystem: false, canLightFlashWithTorch: true},
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useNavigation: () => ({isFocused: () => true}),
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/captureReceipt', () => ({
    __esModule: true,
    default: (camera: unknown, photoOutput: unknown, options: CaptureOptions) => mockCaptureReceipt(camera, photoOutput, options),
    shouldTakePhoto: ({isTorchOn}: {isTorchOn?: boolean}) => !isTorchOn,
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/components/ScannerControlsBar', () => ({
    __esModule: true,
    default: ({capturePhoto}: {capturePhoto: () => void}) => {
        mockCapturePhoto = capturePhoto;
        return null;
    },
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/components/CameraViewport', () => ({
    __esModule: true,
    default: (props: {onStarted?: () => void; isTorchOn?: boolean}) => {
        mockViewportProps = props;
        return null;
    },
}));
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
jest.mock('@pages/iou/request/step/IOURequestStepScan/hooks/useCameraInitTelemetry', () => ({
    __esModule: true,
    default: () => ({handleCameraConfigured: jest.fn(), handleSessionConfigSelected: jest.fn()}),
}));
jest.mock('@hooks/useReceiptPhotoOutput', () => ({__esModule: true, default: () => ({photoOutput: {}, cameraAspectRatio: undefined, updatePhotoResolution: jest.fn()})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
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
jest.mock('@libs/Log', () => ({__esModule: true, default: {info: jest.fn(), warn: jest.fn(), hmmm: jest.fn(), alert: jest.fn()}}));

function renderCamera() {
    render(
        <Camera
            onCapture={jest.fn()}
            onPicked={jest.fn()}
        />,
    );
}

function wasLastCaptureTorchLit() {
    return mockCaptureReceipt.mock.calls.at(-1)?.[2].isTorchOn;
}

describe('Scan camera torch after the camera session restarts', () => {
    let now = 10_000;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFlash = true;
        mockTorchMode = 'on';
        mockCapturePhoto = undefined;
        mockViewportProps = {};
        now = 10_000;
        jest.spyOn(Date, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('turns the torch back on when the camera session starts again with flash on', () => {
        // Given flash is on with the torch path, and the camera stopped and started again, e.g. after going back from confirmation
        renderCamera();

        // When the session reports it started
        act(() => {
            mockViewportProps.onStarted?.();
        });

        // Then the torch is turned on again, because VisionCamera does not re-apply an unchanged torchMode prop
        expect(mockSetTorchMode).toHaveBeenCalledWith('on');
    });

    it('does not touch the torch when the camera starts with flash off', () => {
        // Given flash is off
        mockFlash = false;
        renderCamera();

        // When the session starts
        act(() => {
            mockViewportProps.onStarted?.();
        });

        // Then the torch is left alone
        expect(mockSetTorchMode).not.toHaveBeenCalled();
    });

    it('waits for the exposure again after a restart before trusting the torch', () => {
        // Given flash was turned on long ago, and the camera just restarted and relit the torch
        renderCamera();
        now += 60_000;
        act(() => {
            mockViewportProps.onStarted?.();
        });

        // When the user presses the shutter right after the restart
        now += 100;
        act(() => {
            mockCapturePhoto?.();
        });

        // Then the capture does not count on the torch yet and takes the flash photo
        expect(wasLastCaptureTorchLit()).toBe(false);
    });

    it('uses the torch-lit snapshot once the relit torch had time to settle', () => {
        // Given the camera restarted and relit the torch
        renderCamera();
        act(() => {
            mockViewportProps.onStarted?.();
        });

        // When the user presses the shutter after the settle time
        now += 1_000;
        act(() => {
            mockCapturePhoto?.();
        });

        // Then the capture relies on the torch
        expect(wasLastCaptureTorchLit()).toBe(true);
    });

    it('starts the settle time when the relit torch is on, not when it was requested', async () => {
        // Given the camera restarted and the torch takes most of the settle time to light, as on slow devices
        let lightTorch: () => void = () => {};
        mockSetTorchMode.mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    lightTorch = resolve;
                }),
        );
        renderCamera();
        act(() => {
            mockViewportProps.onStarted?.();
        });
        now += 450;
        await act(async () => {
            lightTorch();
        });

        // When the user presses the shutter 600ms after the request, but only 150ms after the torch lit
        now += 150;
        act(() => {
            mockCapturePhoto?.();
        });

        // Then the exposure has not adjusted to the torch yet, so the capture takes the flash photo
        expect(wasLastCaptureTorchLit()).toBe(false);
    });
});
