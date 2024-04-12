import React from 'react';
import type {ForwardedRef} from 'react';
import {Camera} from 'react-native-vision-camera';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';
import type {NavigationAwareCameraNativeProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera({cameraTabIndex, ...props}: NavigationAwareCameraNativeProps, ref: ForwardedRef<Camera>) {
    const isCameraActive = useTabNavigatorFocus({tabIndex: cameraTabIndex});

    return (
        <Camera
            ref={ref}
            photoQualityBalance="speed"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isActive={isCameraActive}
        />
    );
}

NavigationAwareCamera.displayName = 'NavigationAwareCamera';

export default React.forwardRef(NavigationAwareCamera);
