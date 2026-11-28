import {act, render, screen} from '@testing-library/react-native';

import Camera from '@pages/iou/request/step/IOURequestStepScan/components/Camera/index.native';

import type {View as ReactNativeView} from 'react-native';

import React from 'react';

let mockIsFocused = true;
// One object for every render, as the real navigation object is.
const mockNavigation = {isFocused: () => mockIsFocused, addListener: () => () => {}};
let mockCapturePhoto: (() => void) | undefined;
let mockResolveCapture: (photo: unknown) => void = () => {};

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
    useNavigation: () => mockNavigation,
    // Runs after every render, as a focus effect does when its callback is not memoized, so state the camera keeps across
    // renders is checked against the worst case.
    useFocusEffect: (effect: () => void | (() => void)) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately runs after every render
        jest.requireActual<typeof React>('react').useEffect(effect);
    },
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/captureReceipt', () => ({
    __esModule: true,
    default: () =>
        new Promise((resolve) => {
            mockResolveCapture = resolve;
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

type MockPreviewProps = {source: string; onFinish: () => void};
let mockPreviewProps: MockPreviewProps | undefined;
jest.mock('@pages/iou/request/step/IOURequestStepScan/documentDetection/CapturedReceiptPreview', () => ({
    __esModule: true,
    default: (props: MockPreviewProps) => {
        mockPreviewProps = props;
        const {View} = jest.requireActual<{View: typeof ReactNativeView}>('react-native');
        return <View testID="captured-receipt-preview" />;
    },
}));

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
const mockDiscard = jest.fn<Promise<void>, [string]>(() => Promise.resolve());
jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: () => mockAdopt(),
        discard: (uriOrPath: string) => mockDiscard(uriOrPath),
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

const mockOnCapture = jest.fn();

function renderFocusedCamera() {
    return render(
        <Camera
            onCapture={mockOnCapture}
            onPicked={jest.fn()}
        />,
    );
}

async function captureReceipt(isTransformed: boolean) {
    act(() => {
        mockCapturePhoto?.();
    });
    await act(async () => {
        mockResolveCapture({path: '/tmp/photo.jpg', width: 700, height: 1260, isTransformed});
    });
}

describe('Scan camera captured-receipt preview', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsFocused = true;
        mockCapturePhoto = undefined;
        mockPreviewProps = undefined;
        mockAdopt = () => Promise.resolve('receipt.jpg');
    });

    it('shows a cropped receipt before handing it to the confirmation page', async () => {
        // Given the scan screen, and a capture the crop straightened
        renderFocusedCamera();

        // When the receipt is captured
        await captureReceipt(true);

        // Then the cropped receipt is shown in place of the camera, and the confirmation page waits for it
        expect(mockPreviewProps?.source).toBe('file:///receipts/receipt.jpg');
        expect(mockOnCapture).not.toHaveBeenCalled();

        // When the preview has been on screen long enough
        act(() => {
            mockPreviewProps?.onFinish();
        });

        // Then the receipt goes on to the confirmation page, once
        expect(mockOnCapture).toHaveBeenCalledTimes(1);
        expect(mockOnCapture).toHaveBeenCalledWith(expect.objectContaining({name: 'receipt.jpg'}), 'file:///receipts/receipt.jpg');
        act(() => {
            mockPreviewProps?.onFinish();
        });
        expect(mockOnCapture).toHaveBeenCalledTimes(1);
    });

    it('goes straight on when the capture kept the full frame', async () => {
        // Given the scan screen, and a capture in which no receipt was found to crop to
        renderFocusedCamera();

        // When the receipt is captured
        await captureReceipt(false);

        // Then there is nothing new to show, so the confirmation page opens at once
        expect(mockPreviewProps).toBeUndefined();
        expect(mockOnCapture).toHaveBeenCalledTimes(1);
    });

    it('deletes the cropped receipt when the user leaves while it is shown', async () => {
        // Given a cropped receipt on screen, waiting to go to the confirmation page
        const {unmount} = renderFocusedCamera();
        await captureReceipt(true);

        // When the user leaves the scan screen before the preview ends
        unmount();

        // Then the receipt nobody will submit is deleted, and the confirmation page never opens
        expect(mockDiscard).toHaveBeenCalledWith('file:///receipts/receipt.jpg');
        expect(mockOnCapture).not.toHaveBeenCalled();
    });

    it('takes the card down when the hand-off stays on the scan screen', async () => {
        // Given a cropped receipt on screen, and a hand-off that does not navigate away, as when no receipt file could be built
        jest.useFakeTimers();
        renderFocusedCamera();
        await captureReceipt(true);
        expect(screen.getByTestId('captured-receipt-preview')).toBeTruthy();

        // When the preview ends and the screen is still showing well after a transition would have started
        act(() => {
            mockPreviewProps?.onFinish();
        });
        act(() => {
            jest.advanceTimersByTime(1500);
        });

        // Then the card is gone, so the camera and its controls can be used again instead of staying covered
        expect(mockOnCapture).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('captured-receipt-preview')).toBeNull();
        jest.useRealTimers();
    });

    it('keeps the cropped receipt on screen when the camera renders again', async () => {
        // Given a cropped receipt on screen
        const {rerender} = renderFocusedCamera();
        await captureReceipt(true);

        // When the camera renders again while the card is showing, as any state or prop change makes it
        rerender(
            <Camera
                onCapture={mockOnCapture}
                onPicked={jest.fn()}
            />,
        );

        // Then the card is still there and the receipt is still waiting for it, so a re-render never drops the hand-off
        expect(screen.getByTestId('captured-receipt-preview')).toBeTruthy();
        act(() => {
            mockPreviewProps?.onFinish();
        });
        expect(mockOnCapture).toHaveBeenCalledTimes(1);
    });
});
