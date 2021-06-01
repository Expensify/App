import React from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import withWindowDimensions from '../../withWindowDimensions';
import propTypes from './GrowlNotificationContainerPropTypes';

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

export default withWindowDimensions(GrowlNotificationContainer);
