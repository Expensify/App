import React from 'react';
import type {ForwardedRef} from 'react';
import {Camera as VisionCamera} from 'react-native-vision-camera';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
import type {NavigationAwareCameraNativeProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function Camera({cameraTabIndex, ...props}: NavigationAwareCameraNativeProps, ref: ForwardedRef<VisionCamera>) {
    const isCameraActive = useTabNavigatorFocus({tabIndex: cameraTabIndex});

    return (
        <VisionCamera
            ref={ref}
            photoQualityBalance="speed"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isActive={isCameraActive}
        />
    );
}

Camera.displayName = 'NavigationAwareCamera';

export default React.forwardRef(Camera);
