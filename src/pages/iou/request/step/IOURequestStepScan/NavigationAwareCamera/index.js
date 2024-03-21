import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Webcam from 'react-webcam';
import useTabNavigatorFocus from '@hooks/useTabNavigatorFocus';

const propTypes = {
    /** The index of the tab that contains this camera */
    cameraTabIndex: PropTypes.number.isRequired,
};

// Wraps a camera that will only be active when the tab is focused or as soon as it starts to become focused.
const NavigationAwareCamera = React.forwardRef(({cameraTabIndex, ...props}, ref) => {
    const shouldShowCamera = useTabNavigatorFocus({
        tabIndex: cameraTabIndex,
    });

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
            />
        </View>
    );
});

NavigationAwareCamera.propTypes = propTypes;
NavigationAwareCamera.displayName = 'NavigationAwareCamera';

export default NavigationAwareCamera;
