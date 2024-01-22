import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Webcam from 'react-webcam';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';

const propTypes = {
    /** Flag to turn on/off the torch/flashlight - if available */
    torchOn: PropTypes.bool,

    /** The index of the tab that contains this camera */
    cameraTabIndex: PropTypes.number.isRequired,

    /** Callback function when media stream becomes available - user granted camera permissions and camera starts to work */
    onUserMedia: PropTypes.func,

    /** Callback function passing torch/flashlight capability as bool param of the browser */
    onTorchAvailability: PropTypes.func,
};

const defaultProps = {
    onUserMedia: undefined,
    onTorchAvailability: undefined,
    torchOn: false,
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
const NavigationAwareCamera = React.forwardRef(({torchOn, onTorchAvailability, cameraTabIndex, ...props}, ref) => {
    const trackRef = useRef(null);
    const shouldShowCamera = useTabNavigatorFocus({
        tabIndex: cameraTabIndex,
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
