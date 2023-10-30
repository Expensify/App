import React, {useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useTabAnimation} from '@react-navigation/material-top-tabs';

const propTypes = {
    /* Flag to turn on/off the torch/flashlight - if available */
    torchOn: PropTypes.bool,

    /* The index of the tab that contains this camera */
    cameraTabIndex: PropTypes.number.isRequired,

    /* Whether we're in a tab navigator */
    isInTabNavigator: PropTypes.bool.isRequired,

    /* Callback function when media stream becomes available - user granted camera permissions and camera starts to work */
    onUserMedia: PropTypes.func,

    /* Callback function passing torch/flashlight capability as bool param of the browser */
    onTorchAvailability: PropTypes.func,
};

const defaultProps = {
    onUserMedia: undefined,
    onTorchAvailability: undefined,
    torchOn: false,
};

function useTabNavigatorFocus({cameraTabIndex, isInTabNavigator}) {
    // Get navigation to get initial isFocused value (only needed once during init!)
    const isPageFocused = useIsFocused();
    const [isTabFocused, setIsTabFocused] = useState(false);

    // Retrieve the animation value from the tab navigator, which ranges from 0 to the total number of pages displayed.
    // Even a minimal scroll towards the camera page (e.g., a value of 0.001 at start) should activate the camera for immediate responsiveness.

    // STOP!!!!!!! This is not a pattern to be followed! We are conditionally rendering this hook becase when used in the edit flow we'll never be inside a tab navigator.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tabPositionAnimation = isInTabNavigator ? useTabAnimation() : null;

    useEffect(() => {
        if (!tabPositionAnimation) {
            return;
        }
        const index = Number(cameraTabIndex);

        const listenerId = tabPositionAnimation.addListener(({value}) => {
            // Activate camera as soon the index is animating towards the `cameraTabIndex`
            requestAnimationFrame(() => {
                setIsTabFocused(value > index - 1 && value < index + 1);
            });
        });

        // We need to get the position animation value on component initialization to determine
        // if the tab is focused or not. Since it's an Animated.Value the only synchronous way
        // to retrieve the value is to use a private method.
        // eslint-disable-next-line no-underscore-dangle
        const initialTabPositionValue = tabPositionAnimation.__getValue();

        requestAnimationFrame(() => {
            setIsTabFocused(initialTabPositionValue > index - 1 && initialTabPositionValue < index + 1);
        });

        return () => {
            tabPositionAnimation.removeListener(listenerId);
        };
    }, [cameraTabIndex, tabPositionAnimation, isInTabNavigator]);

    return isTabFocused && isPageFocused;
}

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
const NavigationAwareCamera = React.forwardRef(({torchOn, onTorchAvailability, cameraTabIndex, isInTabNavigator, ...props}, ref) => {
    const trackRef = useRef(null);
    const shouldShowCamera = useTabNavigatorFocus({
        cameraTabIndex,
        isInTabNavigator,
    });

    const handleOnUserMedia = (stream) => {
        if (props.onUserMedia) {
            props.onUserMedia(stream);
        }

        const [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
            trackRef.current = track;
        }
        if (onTorchAvailability) {
            onTorchAvailability(!!capabilities.torch);
        }
    };

    useEffect(() => {
        if (!trackRef.current) {
            return;
        }

        trackRef.current.applyConstraints({
            advanced: [{torch: torchOn}],
        });
    }, [torchOn]);

    if (!shouldShowCamera) {
        return null;
    }
    return (
        <View>
            <Webcam
                audio={false}
                screenshotFormat="image/png"
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
                onUserMedia={handleOnUserMedia}
            />
        </View>
    );
});

NavigationAwareCamera.propTypes = propTypes;
NavigationAwareCamera.displayName = 'NavigationAwareCamera';
NavigationAwareCamera.defaultProps = defaultProps;

export default NavigationAwareCamera;
