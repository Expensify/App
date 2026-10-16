import {act, render} from '@testing-library/react-native';

import IOURequestStepOdometerImage from '@pages/iou/request/step/IOURequestStepOdometerImage/index.native';

import type {ReactNode} from 'react';

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
            camera: {
                current: {
                    takePhoto: () =>
                        new Promise((_resolve, reject) => {
                            mockRejectCapture = reject;
                        }),
                },
            },
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

jest.mock('@pages/iou/request/step/IOURequestStepScan/components/ScannerControlsBar', () => ({
    __esModule: true,
    default: ({capturePhoto}: {capturePhoto: () => void}) => {
        mockCapturePhoto = capturePhoto;
        return null;
    },
}));

jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => ({
    __esModule: true,
    default: <T,>(component: T) => component,
}));
jest.mock('@pages/iou/request/step/StepScreenWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: ReactNode}) => children,
}));
jest.mock('@pages/iou/request/step/IOURequestStepScan/components/CameraViewport', () => () => null);
jest.mock('@pages/iou/request/step/IOURequestStepScan/components/CameraPermissionPrompt', () => () => null);

jest.mock('@components/FullScreenLoaderContext', () => ({
    useFullScreenLoaderActions: () => ({setIsLoaderVisible: jest.fn()}),
}));
jest.mock('@hooks/useFilesValidation', () => ({__esModule: true, default: () => ({validateFiles: jest.fn()})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useIsInLandscapeMode', () => ({__esModule: true, default: () => false}));
jest.mock('react-native-vision-camera', () => ({useCameraFormat: () => undefined}));
jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {fs: {isDir: () => Promise.resolve(true), mkdir: () => Promise.resolve()}},
}));
jest.mock('@libs/getReceiptsUploadFolderPath', () => ({__esModule: true, default: () => '/receipts'}));
jest.mock('@libs/telemetry/activeSpans', () => ({
    cancelSpan: jest.fn(),
    endSpan: jest.fn(),
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

const ROUTE_PARAMS = {
    action: 'create',
    iouType: 'request',
    transactionID: '1',
    reportID: '1',
    imageType: 'start',
};

function renderFocusedOdometerCamera() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const props = {route: {params: ROUTE_PARAMS}, transaction: undefined} as unknown as React.ComponentProps<typeof IOURequestStepOdometerImage>;
    render(<IOURequestStepOdometerImage {...props} />);
    act(() => {
        mockFocusCallbacks.onFocusStart?.();
    });
}

async function pressShutter() {
    await act(async () => {
        mockCapturePhoto?.();
    });
}

async function failCapture() {
    await act(async () => {
        mockRejectCapture(CAMERA_CLOSED_ERROR);
    });
}

describe('Odometer camera capture cancelled by leaving the screen', () => {
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

    it('does not show the camera error alert when the capture fails after the user left the odometer camera', async () => {
        // Given a flash capture is still in progress on the focused odometer camera
        renderFocusedOdometerCamera();
        await pressShutter();

        // When the user leaves the screen and the camera closing cancels that capture
        act(() => {
            mockFocusCallbacks.onFocusCleanup?.();
        });
        await failCapture();

        // Then no alert appears on the screen the user went to, but the failure is still logged so real errors stay visible
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', CAMERA_CLOSED_ERROR.message);
    });

    it('still shows the camera error alert when the capture fails while the user is on the odometer camera', async () => {
        // Given a capture is in progress on the focused odometer camera
        renderFocusedOdometerCamera();
        await pressShutter();

        // When the capture fails while the user is still there
        await failCapture();

        // Then the user is told the camera failed, as before
        expect(alertSpy).toHaveBeenCalledWith('receipt.cameraErrorTitle', 'receipt.cameraErrorMessage');
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', CAMERA_CLOSED_ERROR.message);
    });
});
