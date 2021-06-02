import React from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../withWindowDimensions';
import GrowlNotificationContainerPropTypes from './GrowlNotificationContainerPropTypes';

const propTypes = {
    ...GrowlNotificationContainerPropTypes,
    ...windowDimensionsPropTypes,
};

const GrowlNotificationContainer = ({children, translateY, isSmallScreenWidth}) => (
    <Animated.View
        style={[
            styles.growlNotificationContainer,
            styles.growlNotificationDesktopContainer,
            styles.growlNotificationTranslateY(translateY),
            isSmallScreenWidth && styles.mwn,
        ]}
    >
        {children}
    </Animated.View>
);

GrowlNotificationContainer.propTypes = propTypes;
GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default withWindowDimensions(GrowlNotificationContainer);
