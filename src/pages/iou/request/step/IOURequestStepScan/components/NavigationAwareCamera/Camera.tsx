import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {Platform} from 'react-native';
import {Camera as VisionCamera} from 'react-native-vision-camera';

import type {NavigationAwareCameraNativeProps} from './types';

// iOS `takeSnapshot` requires the video pipeline to be running so it can grab a frame from it.
// Android's `takeSnapshot` is a GPU screenshot of the preview view and doesn't need this.
const IS_VIDEO_REQUIRED_FOR_SNAPSHOT = Platform.OS === 'ios';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function Camera({cameraTabIndex, ref, forceInactive = false, shouldStayActiveWhenBlurred = false, ...props}: NavigationAwareCameraNativeProps) {
    const isFocused = useIsFocused();

    // The scan screen blurs as soon as a capture navigates away, and closing the session would cancel a
    // capture that is still running.
    const isCameraActive = (isFocused || shouldStayActiveWhenBlurred) && !forceInactive;

    return (
        <VisionCamera
            ref={ref}
            photoQualityBalance="quality"
            video={IS_VIDEO_REQUIRED_FOR_SNAPSHOT}
            {...props}
            isActive={isCameraActive}
        />
    );
}

export default Camera;
