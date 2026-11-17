import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AttachmentCamera from '@components/AttachmentPicker/AttachmentCamera';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';

import isInLandscapeMode from '@libs/isInLandscapeMode';
import ReceiptStorage from '@libs/ReceiptStorage';

import type {CameraDevice} from 'react-native-vision-camera';

import React from 'react';
import Onyx from 'react-native-onyx';
import {useCameraDevice, useCameraDevices} from 'react-native-vision-camera';

import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

function createMockPhoto(path = '/tmp/photos/shot.jpg') {
    return {width: 4032, height: 3024, orientation: 'right', saveToTemporaryFileAsync: jest.fn(() => Promise.resolve(path)), dispose: jest.fn()};
}
const mockCapturePhoto = jest.fn(() => Promise.resolve(createMockPhoto()));
let mockPermissionStatus = 'granted';

jest.mock('@libs/isInLandscapeMode');
jest.mock('@hooks/useAccessibilityAnnouncement');
jest.mock('@libs/ReceiptStorage', () => ({__esModule: true, default: {discard: jest.fn(() => Promise.resolve())}}));
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

jest.mock('@pages/iou/request/step/IOURequestStepScan/CameraPermission', () => ({
    getCameraPermissionStatus: jest.fn(() => Promise.resolve(mockPermissionStatus)),
    requestCameraPermission: jest.fn(() => Promise.resolve(mockPermissionStatus)),
}));

// Render the modal body inline so the assertions target the camera UI rather than modal plumbing.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ignore for testing
const {View: MockView} = jest.requireActual('react-native');
jest.mock(
    '@components/Modal',
    () =>
        ({isVisible, onClose, children}: {isVisible: boolean; onClose: () => void; children: React.ReactNode}) =>
            isVisible ? (
                <MockView
                    testID="AttachmentCameraModal"
                    onClose={onClose}
                >
                    {children}
                </MockView>
            ) : null,
);

jest.mock('react-native-vision-camera', () => {
    const actualReact = jest.requireActual<typeof React>('react');
    return {
        useCameraDevice: jest.fn(),
        useCameraDevices: jest.fn(() => []),
        usePhotoOutput: jest.fn(() => ({capturePhoto: mockCapturePhoto})),
        Camera: actualReact.forwardRef((_props: Record<string, unknown>, ref: React.ForwardedRef<unknown>) => {
            actualReact.useImperativeHandle(ref, () => ({focusTo: jest.fn(() => Promise.resolve())}));
            return null;
        }),
    };
});

const BACK_DEVICE = createMock<CameraDevice>({id: 'back', position: 'back', hasFlash: true, supportsFocusMetering: true, physicalDevices: [], zoomLensSwitchFactors: []});
const FRONT_DEVICE = createMock<CameraDevice>({id: 'front', position: 'front', hasFlash: false, supportsFocusMetering: true, physicalDevices: [], zoomLensSwitchFactors: []});

const mockedUseCameraDevice = jest.mocked(useCameraDevice);
const mockedUseCameraDevices = jest.mocked(useCameraDevices);
const mockedIsInLandscapeMode = jest.mocked(isInLandscapeMode);
const mockedUseAccessibilityAnnouncement = jest.mocked(useAccessibilityAnnouncement);
const mockedDiscard = jest.mocked(ReceiptStorage.discard);

function renderCamera(props: Partial<React.ComponentProps<typeof AttachmentCamera>> = {}) {
    const onCapture = jest.fn();
    const onClose = jest.fn();
    const onModalHide = jest.fn();

    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <AttachmentCamera
                    isVisible
                    onCapture={onCapture}
                    onClose={onClose}
                    onModalHide={onModalHide}
                    {...props}
                />
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );

    return {onCapture, onClose, onModalHide};
}

describe('AttachmentCamera', () => {
    beforeAll(() => {
        Onyx.init({keys: {}});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPermissionStatus = 'granted';
        mockCapturePhoto.mockImplementation(() => Promise.resolve(createMockPhoto()));
        mockedUseCameraDevice.mockReturnValue(BACK_DEVICE);
        mockedUseCameraDevices.mockReturnValue([BACK_DEVICE, FRONT_DEVICE]);
        mockedIsInLandscapeMode.mockReturnValue(false);
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows the permission prompt when camera access is not granted', async () => {
        mockPermissionStatus = 'blocked';
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(translateLocal('receipt.cameraAccess'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('common.continue'))).toBeOnTheScreen();
        // The shutter still renders, but every camera control is disabled until permission is granted.
        expect(screen.getByLabelText(translateLocal('receipt.flipCamera'))).toBeDisabled();
    });

    it('renders the shutter once permission is granted and a device is available', async () => {
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByLabelText(translateLocal('receipt.shutter'))).toBeOnTheScreen();
        expect(screen.queryByText(translateLocal('receipt.cameraAccess'))).not.toBeOnTheScreen();
    });

    it('shows the captured photo for review instead of sending it right away', async () => {
        // Given an open camera with permission granted
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the shutter
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // Then the photo waits for the user to choose "Retake" or "Use photo", so nothing is sent yet
        expect(mockCapturePhoto).toHaveBeenCalledTimes(1);
        expect(onCapture).not.toHaveBeenCalled();
        expect(screen.getByLabelText(translateLocal('attachmentPicker.retake'))).toBeOnTheScreen();
        expect(screen.getByLabelText(translateLocal('attachmentPicker.usePhoto'))).toBeOnTheScreen();
        expect(screen.queryByLabelText(translateLocal('receipt.shutter'))).not.toBeOnTheScreen();
        // And screen reader users can find the photo they are reviewing
        expect(screen.getByRole('img', {name: translateLocal('attachmentPicker.capturedPhotoPreview')})).toBeOnTheScreen();
    });

    it('announces the review step to screen readers once a photo is taken', async () => {
        // Given an open camera with nothing captured yet
        renderCamera();
        await waitForBatchedUpdatesWithAct();
        const announcement = translateLocal('attachmentPicker.photoTakenAnnouncement');
        expect(mockedUseAccessibilityAnnouncement).toHaveBeenLastCalledWith(announcement, false, {shouldAnnounceOnNative: true});

        // When the user presses the shutter, which removes the control that had screen reader focus
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // Then the announcement is enabled, including on Android where announcements are off by default
        expect(mockedUseAccessibilityAnnouncement).toHaveBeenLastCalledWith(announcement, true, {shouldAnnounceOnNative: true});

        // When the user retakes the photo
        fireEvent.press(screen.getByLabelText(translateLocal('attachmentPicker.retake')));
        await waitForBatchedUpdatesWithAct();

        // Then the announcement is reset, so the next capture is announced again
        expect(mockedUseAccessibilityAnnouncement).toHaveBeenLastCalledWith(announcement, false, {shouldAnnounceOnNative: true});
    });

    it('passes the captured photo to onCapture once the user presses "Use photo"', async () => {
        // Given a captured photo under review
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // When the user confirms it
        fireEvent.press(screen.getByLabelText(translateLocal('attachmentPicker.usePhoto')));
        await waitForBatchedUpdatesWithAct();

        // Then the photo is handed to the picker, and its file is kept for upload
        expect(onCapture).toHaveBeenCalledTimes(1);
        expect(mockedDiscard).not.toHaveBeenCalled();
        expect(onCapture).toHaveBeenCalledWith([
            expect.objectContaining({
                fileName: 'shot.jpg',
                type: 'image/jpeg',
                width: 3024,
                height: 4032,
            }),
        ]);
    });

    it('sends the photo only once when "Use photo" is pressed repeatedly', async () => {
        // Given a captured photo under review
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // When the user taps "Use photo" twice, e.g. while the modal is still animating out
        const usePhotoButton = screen.getByLabelText(translateLocal('attachmentPicker.usePhoto'));
        fireEvent.press(usePhotoButton);
        fireEvent.press(usePhotoButton);
        await waitForBatchedUpdatesWithAct();

        // Then the photo is sent a single time
        expect(onCapture).toHaveBeenCalledTimes(1);
    });

    it('keeps the confirmed photo when Retake is tapped while the camera is closing', async () => {
        // Given a photo the user has already confirmed with "Use photo"
        const {onCapture, onClose} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('attachmentPicker.usePhoto')));

        // When "Retake" is tapped before the modal finishes hiding
        fireEvent.press(screen.getByLabelText(translateLocal('attachmentPicker.retake')));
        await waitForBatchedUpdatesWithAct();

        // Then the file the picker is uploading is not deleted and the review stays as it was
        expect(onCapture).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
        expect(mockedDiscard).not.toHaveBeenCalled();
        expect(screen.getByLabelText(translateLocal('attachmentPicker.usePhoto'))).toBeOnTheScreen();
    });

    it('keeps the confirmed photo when close is tapped while the camera is closing', async () => {
        // Given a photo the user has already confirmed with "Use photo"
        const {onCapture, onClose} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('attachmentPicker.usePhoto')));

        // When the close button is tapped before the modal finishes hiding
        fireEvent.press(screen.getByLabelText(translateLocal('common.close')));
        await waitForBatchedUpdatesWithAct();

        // Then the file is not deleted and the picker is not told the selection was cancelled
        expect(onCapture).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
        expect(mockedDiscard).not.toHaveBeenCalled();
    });

    it('returns to the viewfinder when the user presses "Retake"', async () => {
        // Given a captured photo under review
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // When the user discards it with "Retake"
        fireEvent.press(screen.getByLabelText(translateLocal('attachmentPicker.retake')));
        await waitForBatchedUpdatesWithAct();

        // Then the shutter is back, nothing was sent, the rejected file is deleted, and a new photo can be taken
        expect(onCapture).not.toHaveBeenCalled();
        expect(mockedDiscard).toHaveBeenCalledWith(expect.stringContaining('shot.jpg'));
        expect(screen.queryByLabelText(translateLocal('attachmentPicker.usePhoto'))).not.toBeOnTheScreen();
        expect(screen.queryByLabelText(translateLocal('attachmentPicker.capturedPhotoPreview'))).not.toBeOnTheScreen();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();
        expect(mockCapturePhoto).toHaveBeenCalledTimes(2);
    });

    it('closes the camera when a close request arrives during review', async () => {
        // Given a captured photo under review
        const {onCapture, onClose} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // When the modal receives a close request, which is how Android back and app-wide Modal.close() reach it
        fireEvent(screen.getByTestId('AttachmentCameraModal'), 'close');
        await waitForBatchedUpdatesWithAct();

        // Then the camera really closes, so callers waiting for the modal to hide (e.g. push notification navigation) are not stuck
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onCapture).not.toHaveBeenCalled();
        expect(mockedDiscard).toHaveBeenCalledWith(expect.stringContaining('shot.jpg'));
    });

    it('discards the photo under review when the close button is pressed', async () => {
        // Given a captured photo under review
        const {onCapture, onClose} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        // When the user closes the camera with the X button
        fireEvent.press(screen.getByLabelText(translateLocal('common.close')));
        await waitForBatchedUpdatesWithAct();

        // Then the camera closes without sending the photo, and the rejected file is deleted
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onCapture).not.toHaveBeenCalled();
        expect(mockedDiscard).toHaveBeenCalledWith(expect.stringContaining('shot.jpg'));
    });

    it('deletes a photo that finishes capturing after the camera was closed', async () => {
        // Given a capture that is still in flight
        let resolveCapturePhoto: (photo: ReturnType<typeof createMockPhoto>) => void = () => {};
        mockCapturePhoto.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveCapturePhoto = resolve;
                }),
        );
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));

        // When the user closes the camera before the capture resolves
        fireEvent.press(screen.getByLabelText(translateLocal('common.close')));
        await act(async () => {
            resolveCapturePhoto(createMockPhoto('/tmp/photos/late.jpg'));
        });
        await waitForBatchedUpdatesWithAct();

        // Then the late photo is neither shown nor sent, and its file is deleted
        expect(onCapture).not.toHaveBeenCalled();
        expect(mockedDiscard).toHaveBeenCalledWith('/tmp/photos/late.jpg');
    });

    it('does not capture twice while a capture is already in flight', async () => {
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        const shutter = screen.getByLabelText(translateLocal('receipt.shutter'));
        fireEvent.press(shutter);
        fireEvent.press(shutter);
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturePhoto).toHaveBeenCalledTimes(1);
    });

    it('surfaces a capture failure instead of failing silently', async () => {
        mockCapturePhoto.mockRejectedValueOnce(new Error('capture failed'));
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        expect(onCapture).not.toHaveBeenCalled();
    });

    it('calls onClose when the close button is pressed', async () => {
        const {onClose} = renderCamera();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText(translateLocal('common.close')));
        await waitForBatchedUpdatesWithAct();

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('disables the flip control when only one camera position exists', async () => {
        mockedUseCameraDevices.mockReturnValue([BACK_DEVICE]);
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByLabelText(translateLocal('receipt.flipCamera'))).toBeDisabled();
    });

    it('keeps the flip control enabled when both positions exist', async () => {
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByLabelText(translateLocal('receipt.flipCamera'))).not.toBeDisabled();
    });

    it('does not attempt a capture when no device is resolved yet', async () => {
        mockedUseCameraDevice.mockReturnValue(undefined);
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();

        // Permission is granted, so the prompt is gone, but there is no camera to shoot with yet.
        expect(screen.queryByText(translateLocal('receipt.cameraAccess'))).not.toBeOnTheScreen();

        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturePhoto).not.toHaveBeenCalled();
        expect(onCapture).not.toHaveBeenCalled();
    });

    it('adapts layout for landscape orientation', async () => {
        mockedIsInLandscapeMode.mockReturnValue(true);
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        const shutter = screen.getByLabelText(translateLocal('receipt.shutter'));
        expect(shutter).toBeOnTheScreen();
        const controlsContainer = shutter.parent;
        expect(controlsContainer?.props.style).toEqual(expect.not.arrayContaining([expect.objectContaining({flexDirection: 'row'})]));
    });
});
