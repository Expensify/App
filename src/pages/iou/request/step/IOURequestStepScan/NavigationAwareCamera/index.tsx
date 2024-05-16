import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {Camera} from 'react-native-vision-camera';
import Webcam from 'react-webcam';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
import type {NavigationAwareCameraProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera({torchOn, onTorchAvailability, cameraTabIndex, ...props}: NavigationAwareCameraProps, ref: ForwardedRef<Webcam | Camera>) {
    const shouldShowCamera = useTabNavigatorFocus({
        tabIndex: cameraTabIndex,
    });

    if (!shouldShowCamera) {
        return null;
    }
    return (
        <View>
            <Webcam
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref as unknown as ForwardedRef<Webcam>}
            />
        </View>
    );
}

NavigationAwareCamera.displayName = 'NavigationAwareCamera';

export default React.forwardRef(NavigationAwareCamera);
