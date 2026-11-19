import {act, render} from '@testing-library/react-native';

import IOURequestStepOdometerImage from '@pages/iou/request/step/IOURequestStepOdometerImage/index.native';

import type {ReactNode} from 'react';

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
let mockCrop: (image: unknown) => Promise<unknown> = (image) => Promise.resolve(image);
jest.mock('@pages/iou/request/step/IOURequestStepScan/cropImageToAspectRatio', () => ({
    cropImageToAspectRatio: (image: unknown) => mockCrop(image),
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
jest.mock('@hooks/useReceiptPhotoOutput', () => ({__esModule: true, default: () => ({photoOutput: {}, cameraAspectRatio: undefined, updatePhotoResolution: jest.fn()})}));
jest.mock('@libs/cameraCapture', () => ({
    capturePhotoToPath: () =>
        new Promise((resolve, reject) => {
            mockResolveCapture = resolve;
            mockRejectCapture = reject;
        }),
}));
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

jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: () => Promise.resolve('odometer.jpg'),
        toLocalUri: (durableName: string) => `file:///receipts/${durableName}`,
    },
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
    const props = {route: {params: ROUTE_PARAMS}, navigation: {isFocused: () => mockIsFocused}, transaction: undefined} as unknown as React.ComponentProps<
        typeof IOURequestStepOdometerImage
    >;
    render(<IOURequestStepOdometerImage {...props} />);
}

async function pressShutter() {
    await act(async () => {
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

describe('Odometer camera capture cancelled by leaving the screen', () => {
    let alertSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsFocused = true;
        mockCapturePhoto = undefined;
        mockCrop = (image) => Promise.resolve(image);
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
        mockIsFocused = false;
        await failCapture();

        // Then no alert appears on the screen the user went to, and the expected cancellation is logged as info, not as a warning
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogInfo).toHaveBeenCalledWith('Photo capture cancelled by leaving the screen', false, {error: CAMERA_CLOSED_ERROR.message});
        expect(mockLogWarn).not.toHaveBeenCalled();
    });

    it('still shows the camera error alert when the capture fails while the user is on the odometer camera', async () => {
        // Given a capture is in progress on the focused odometer camera
        renderFocusedOdometerCamera();
        await pressShutter();

        // When the capture fails while the user is still there
        await failCapture();

        // Then the user is told the camera failed, and the failure is logged as a warning, as before
        expect(alertSpy).toHaveBeenCalledWith('receipt.cameraErrorTitle', 'receipt.cameraErrorMessage');
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', CAMERA_CLOSED_ERROR.message);
    });

    it('still logs a warning, without an alert, when the camera fails for another reason after the user left the odometer camera', async () => {
        // Given a capture is still in progress on the focused odometer camera
        renderFocusedOdometerCamera();
        await pressShutter();

        // When the user leaves the screen and the capture fails with an error that is not the camera closing
        mockIsFocused = false;
        const writeError = new Error('Failed to write the photo to disk');
        await failCapture(writeError);

        // Then no alert appears on the screen the user went to, but the failure stays a warning because it is a real camera error, not a cancellation
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Error taking photo', writeError.message);
        expect(mockLogInfo).not.toHaveBeenCalled();
    });

    it('does not show the camera error alert when processing the photo fails after the user left the odometer camera', async () => {
        // Given a capture is still in progress on the focused odometer camera, and cropping the photo will fail
        const cropError = new Error('Could not crop the photo');
        mockCrop = () => Promise.reject(cropError);
        renderFocusedOdometerCamera();
        await pressShutter();

        // When the user leaves the screen and the photo is taken but fails to process
        mockIsFocused = false;
        await finishCapture();

        // Then no alert appears on the screen the user went to, but the failure is still logged as a warning because it is a real error
        expect(alertSpy).not.toHaveBeenCalled();
        expect(mockLogWarn).toHaveBeenCalledWith('Error cropping photo', cropError.message);
    });
});
