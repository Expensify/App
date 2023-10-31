import React from 'react';
import {Animated} from 'react-native';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import styles from '@styles/styles';
import growlNotificationContainerPropTypes from './growlNotificationContainerPropTypes';

const propTypes = {
    ...growlNotificationContainerPropTypes,
    ...windowDimensionsPropTypes,
};

function GrowlNotificationContainer(props) {
    return (
        <Animated.View
            style={[
                styles.growlNotificationContainer,
                styles.growlNotificationDesktopContainer,
                styles.growlNotificationTranslateY(props.translateY),
                props.isSmallScreenWidth && styles.mwn,
            ]}
        >
            {props.children}
        </Animated.View>
    );
}

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default withWindowDimensions(GrowlNotificationContainer);
