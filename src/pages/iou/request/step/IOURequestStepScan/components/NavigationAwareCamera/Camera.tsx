import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {Camera as VisionCamera} from 'react-native-vision-camera';
import type {NavigationAwareCameraNativeProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function Camera({cameraTabIndex, ref, forceInactive = false, ...props}: NavigationAwareCameraNativeProps) {
    const isFocused = useIsFocused();
    const isCameraActive = isFocused && !forceInactive;

    return (
        <VisionCamera
            ref={ref}
            photoQualityBalance="quality"
            // Disable features that slow down photo capture per VisionCamera perf tips:
            // https://react-native-vision-camera.com/docs/guides/performance
            photoHdr={false}
            videoStabilizationMode="off"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isActive={isCameraActive}
        />
    );
}

export default Camera;
