import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {Camera as VisionCamera} from 'react-native-vision-camera';
import type {NavigationAwareCameraNativeProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function Camera({cameraTabIndex, ref, ...props}: NavigationAwareCameraNativeProps) {
    const isCameraActive = useIsFocused();

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

export default Camera;
