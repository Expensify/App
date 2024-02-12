import React from 'react';
import type {FC} from 'react';
import {Camera} from 'react-native-vision-camera';
import type {CameraDevice} from 'react-native-vision-camera';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';

type NavigationAwareCameraProps = {
    cameraTabIndex: number;
    device: CameraDevice;
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
const NavigationAwareCamera = React.forwardRef(({cameraTabIndex, ...props}: NavigationAwareCameraProps, ref: React.Ref<Camera>) => {
    const isCameraActive = useTabNavigatorFocus({tabIndex: cameraTabIndex});

    return (
        <Camera
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isActive={isCameraActive}
        />
    );
});

(NavigationAwareCamera as FC).displayName = 'NavigationAwareCamera';

export default NavigationAwareCamera;
