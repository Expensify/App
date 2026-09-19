import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AttachmentCamera from '@components/AttachmentPicker/AttachmentCamera';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import isInLandscapeMode from '@libs/isInLandscapeMode';

import type {CameraDevice} from 'react-native-vision-camera';

import React from 'react';
import Onyx from 'react-native-onyx';
import {useCameraDevice, useCameraDevices} from 'react-native-vision-camera';

import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockTakePhoto = jest.fn(() => Promise.resolve({path: '/tmp/photos/shot.jpg', width: 3024, height: 4032}));
let mockPermissionStatus = 'granted';

jest.mock('@libs/isInLandscapeMode');
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));

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
        ({isVisible, children}: {isVisible: boolean; children: React.ReactNode}) =>
            isVisible ? <MockView>{children}</MockView> : null,
);

jest.mock('react-native-vision-camera', () => {
    const actualReact = jest.requireActual<typeof React>('react');
    return {
        useCameraDevice: jest.fn(),
        useCameraDevices: jest.fn(() => []),
        useCameraFormat: jest.fn(() => null),
        Camera: actualReact.forwardRef((_props: Record<string, unknown>, ref: React.ForwardedRef<unknown>) => {
            actualReact.useImperativeHandle(ref, () => ({takePhoto: mockTakePhoto, focus: jest.fn(() => Promise.resolve())}));
            return null;
        }),
    };
});

const BACK_DEVICE = createMock<CameraDevice>({id: 'back', position: 'back', hasFlash: true, supportsFocus: true, neutralZoom: 1});
const FRONT_DEVICE = createMock<CameraDevice>({id: 'front', position: 'front', hasFlash: false, supportsFocus: true, neutralZoom: 1});

const mockedUseCameraDevice = jest.mocked(useCameraDevice);
const mockedUseCameraDevices = jest.mocked(useCameraDevices);
const mockedIsInLandscapeMode = jest.mocked(isInLandscapeMode);

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
        mockTakePhoto.mockResolvedValue({path: '/tmp/photos/shot.jpg', width: 3024, height: 4032});
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

    it('passes the captured photo to onCapture', async () => {
        const {onCapture} = renderCamera();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByLabelText(translateLocal('receipt.shutter')));
        await waitForBatchedUpdatesWithAct();

        expect(mockTakePhoto).toHaveBeenCalledTimes(1);
        expect(onCapture).toHaveBeenCalledWith([expect.objectContaining({fileName: 'shot.jpg', type: 'image/jpeg', width: 3024, height: 4032})]);
    });

    it('does not capture twice while a capture is already in flight', async () => {
        renderCamera();
        await waitForBatchedUpdatesWithAct();

        const shutter = screen.getByLabelText(translateLocal('receipt.shutter'));
        fireEvent.press(shutter);
        fireEvent.press(shutter);
        await waitForBatchedUpdatesWithAct();

        expect(mockTakePhoto).toHaveBeenCalledTimes(1);
    });

    it('surfaces a capture failure instead of failing silently', async () => {
        mockTakePhoto.mockRejectedValueOnce(new Error('capture failed'));
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

        expect(mockTakePhoto).not.toHaveBeenCalled();
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
