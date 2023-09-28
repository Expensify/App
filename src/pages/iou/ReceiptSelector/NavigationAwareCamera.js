import React, {useEffect, useRef} from 'react';
import Webcam from 'react-webcam';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import refPropTypes from '../../../components/refPropTypes';

const propTypes = {
    /* The index of the tab that contains this camera */
    cameraTabIndex: PropTypes.number.isRequired,

    /* Forwarded ref */
    forwardedRef: refPropTypes.isRequired,

    torchOn: PropTypes.bool,

    onUserMedia: PropTypes.func,

    onTorchAvailability: PropTypes.func,
};

const defaultProps = {
    onUserMedia: undefined,
    onTorchAvailability: undefined,
    torchOn: false,
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera({cameraTabIndex, torchOn, onTorchAvailability, ...props}, ref) {
    const trackRef = useRef(null);
    const isCameraActive = useIsFocused();

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

    if (!isCameraActive) {
        return null;
    }
    return (
        <Webcam
            audio={false}
            screenshotFormat="image/jpeg"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onUserMedia={handleOnUserMedia}
        />
    );
}

NavigationAwareCamera.propTypes = propTypes;
NavigationAwareCamera.displayName = 'NavigationAwareCamera';
NavigationAwareCamera.defaultProps = defaultProps;

export default React.forwardRef(NavigationAwareCamera);
