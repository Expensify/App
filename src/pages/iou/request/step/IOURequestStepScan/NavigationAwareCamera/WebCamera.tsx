import {useIsFocused} from '@react-navigation/native';
import React, {useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import Webcam from 'react-webcam';
import useThemeStyles from '@hooks/useThemeStyles';
import type {NavigationAwareCameraProps} from './types';

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function WebCamera({itemRef, ref, ...props}: NavigationAwareCameraProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const shouldShowCamera = useIsFocused();
    const styles = useThemeStyles();

    if (!shouldShowCamera) {
        return null;
    }

    return (
        // Hide the camera during initialization to prevent random failures on some iOS versions.
        <View style={isInitialized ? [styles.dFlex, styles.flex1] : styles.dNone}>
            <Webcam
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                onResize={() => setIsInitialized(true)}
                ref={ref as unknown as ForwardedRef<Webcam>}
            />
        </View>
    );
}

export default WebCamera;
