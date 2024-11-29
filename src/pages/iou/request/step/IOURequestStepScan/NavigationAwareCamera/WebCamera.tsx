import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {Camera} from 'react-native-vision-camera';
import Webcam from 'react-webcam';
import useThemeStyles from '@hooks/useThemeStyles';
import type {NavigationAwareCameraProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function WebCamera({aspectRatio, ...props}: NavigationAwareCameraProps, ref: ForwardedRef<Webcam | Camera>) {
    const shouldShowCamera = useIsFocused();
    const styles = useThemeStyles();

    if (!shouldShowCamera) {
        return null;
    }

    const webcamContainerStyles = {...styles.justifyContentCenter, ...styles.w100, aspectRatio};

    return (
        <View style={webcamContainerStyles}>
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
