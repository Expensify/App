import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {Camera} from 'react-native-vision-camera';
import Webcam from 'react-webcam';
import type {NavigationAwareCameraProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function WebCamera({torchOn, onTorchAvailability, cameraTabIndex, ...props}: NavigationAwareCameraProps, ref: ForwardedRef<Webcam | Camera>) {
    const shouldShowCamera = useIsFocused();

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

WebCamera.displayName = 'NavigationAwareCamera';

export default React.forwardRef(WebCamera);
