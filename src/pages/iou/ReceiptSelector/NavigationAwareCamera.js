import React, {useEffect, useState} from 'react';
import Webcam from 'react-webcam';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import refPropTypes from '../../../components/refPropTypes';

const propTypes = {
    /* The index of the tab that contains this camera */
    cameraTabIndex: PropTypes.number.isRequired,

    /* Forwarded ref */
    forwardedRef: refPropTypes.isRequired,
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
function NavigationAwareCamera({cameraTabIndex, ...props}, ref) {
    const isCameraActive = useIsFocused();

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
        />
    );
}

NavigationAwareCamera.propTypes = propTypes;
NavigationAwareCamera.displayName = 'NavigationAwareCamera';

export default React.forwardRef(NavigationAwareCamera);
