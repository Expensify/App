import React, {useEffect, useState} from 'react';
import {Camera} from 'react-native-vision-camera';
import {useTabAnimation} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import PropTypes from 'prop-types';
import refPropTypes from '../../../components/refPropTypes';

const propTypes = {
    /* The index of the tab that contains this camera */
    cameraTabIndex: PropTypes.number.isRequired,

    /* Forwarded ref */
    forwardedRef: refPropTypes.isRequired,
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera({cameraTabIndex, forwardedRef, ...props}) {
    // Get navigation to get initial isFocused value (only needed once during init!)
    const navigation = useNavigation();
    const [isCameraActive, setIsCameraActive] = useState(navigation.isFocused);

    // Get the animation value from the tab navigator. Its a value between 0 and the
    // number of pages we render in the tab navigator. When we even just slightly start to scroll to the camera page,
    // (value is e.g. 0.001 on animation start) we want to activate the camera, so its as fast as possible active.
    const tabPositionAnimation = useTabAnimation();

    useEffect(() => {
        const listenerId = tabPositionAnimation.addListener(({value}) => {
            // Activate camera as soon the index is animating towards the `cameraTabIndex`
            setIsCameraActive(value > cameraTabIndex - 1 && value < cameraTabIndex + 1);
        });

        return () => {
            tabPositionAnimation.removeListener(listenerId);
        };
    }, [cameraTabIndex, tabPositionAnimation]);

    return (
        <Camera
            ref={forwardedRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isActive={isCameraActive}
        />
    );
}

NavigationAwareCamera.propTypes = propTypes;
NavigationAwareCamera.displayName = 'NavigationAwareCamera';

export default React.forwardRef((props, ref) => (
    <NavigationAwareCamera
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
