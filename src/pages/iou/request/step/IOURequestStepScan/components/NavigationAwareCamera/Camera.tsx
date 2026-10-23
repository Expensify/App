import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {Camera as VisionCamera} from 'react-native-vision-camera';

import type {NavigationAwareCameraNativeProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function Camera({cameraTabIndex, ref, forceInactive = false, shouldStayActiveWhenBlurred = false, ...props}: NavigationAwareCameraNativeProps) {
    const isFocused = useIsFocused();

    // The scan screen blurs as soon as a capture navigates away, and closing the session would cancel a
    // capture that is still running.
    const isCameraActive = (isFocused || shouldStayActiveWhenBlurred) && !forceInactive;

    return (
        <VisionCamera
            ref={ref}
            {...props}
            isActive={isCameraActive}
        />
    );
}

export default Camera;
