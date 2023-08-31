import React, {useEffect, useState} from 'react';
import {Camera} from 'react-native-vision-camera';
import {useTabAnimation} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import refPropTypes from '../../../components/refPropTypes';

const propTypes = {
    /* Forwarded ref */
    forwardedRef: refPropTypes.isRequired,
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera(props) {
    // Get navigation to get initial isFocused value (only needed once during init!)
    const navigation = useNavigation();
    const [isCameraActive, setIsCameraActive] = useState(navigation.isFocused);
    // Get the animation value from the tab navigator. Its a value between 0 and the
    // number of pages we render in the tab navigator. When we even just slightly start
    // to scroll to the camera page, we want to activate the camera (so its as fast as possible active).
    const tabPositionAnimation = useTabAnimation();

    useEffect(() => {
        const listenerId = tabPositionAnimation.addListener(({value}) => {
            setIsCameraActive(value > 0 && value < 2);
        });

        return () => {
            tabPositionAnimation.removeListener(listenerId);
        };
    }, [tabPositionAnimation]);

    return (
        <Camera
            ref={props.forwardedRef}
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
