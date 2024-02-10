import React from 'react';
import {Animated} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
};

function GrowlNotificationContainer(props) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <Animated.View
            style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, styles.growlNotificationTranslateY(props.translateY), shouldUseNarrowLayout && styles.mwn]}
        >
            {props.children}
        </Animated.View>
    );
}

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
