import {render} from '@testing-library/react-native';

import NavigationAwareCamera from '@pages/iou/request/step/IOURequestStepScan/components/NavigationAwareCamera/Camera';

import type {CameraDevice} from 'react-native-vision-camera';

import React from 'react';

const mockUseIsFocused = jest.fn<boolean, []>();
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockUseIsFocused(),
}));

const mockVisionCamera = jest.fn<void, [{isActive: boolean}]>();
jest.mock('react-native-vision-camera', () => ({
    Camera: (props: {isActive: boolean}) => {
        mockVisionCamera(props);
        return null;
    },
}));

// The wrapper passes the device straight through to a camera that is stubbed out here, so it only has to
// satisfy the prop type.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const DEVICE = {id: 'back'} as unknown as CameraDevice;

/** The session state the camera ends up in for one combination of focus and the two overrides. */
function renderIsActive({isFocused, forceInactive, shouldStayActiveWhenBlurred}: {isFocused: boolean; forceInactive?: boolean; shouldStayActiveWhenBlurred?: boolean}): boolean {
    mockUseIsFocused.mockReturnValue(isFocused);
    mockVisionCamera.mockClear();

    render(
        <NavigationAwareCamera
            cameraTabIndex={1}
            device={DEVICE}
            forceInactive={forceInactive}
            shouldStayActiveWhenBlurred={shouldStayActiveWhenBlurred}
        />,
    );

    return !!mockVisionCamera.mock.calls.at(0)?.at(0)?.isActive;
}

describe('NavigationAwareCamera', () => {
    it('runs the session while the scan tab is focused and nothing has forced it shut', () => {
        expect(renderIsActive({isFocused: true})).toBe(true);
        expect(renderIsActive({isFocused: false})).toBe(false);
    });

    it('keeps the session running once a capture navigates away and the screen blurs', () => {
        // Closing it here cancels an in-flight `takePhoto` with "Camera is closed.", which is the whole
        // reason a full-resolution capture can outlive the shutter.
        expect(renderIsActive({isFocused: false, shouldStayActiveWhenBlurred: true})).toBe(true);
    });

    it('lets forceInactive win over a capture that is still running, since it is the harder stop', () => {
        expect(renderIsActive({isFocused: true, forceInactive: true})).toBe(false);
        expect(renderIsActive({isFocused: false, forceInactive: true, shouldStayActiveWhenBlurred: true})).toBe(false);
        expect(renderIsActive({isFocused: true, forceInactive: true, shouldStayActiveWhenBlurred: true})).toBe(false);
    });
});
