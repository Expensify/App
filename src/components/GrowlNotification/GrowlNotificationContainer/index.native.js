import React from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import propTypes from './GrowlNotificationContainerPropTypes';

const GrowlNotificationContainer = ({children, translateY}) => (
    <Animated.View
        style={[
            styles.growlNotificationContainer,
            styles.growlNotificationTranslateY(translateY),
        ]}
    >
        {children}
    </Animated.View>
);

GrowlNotificationContainer.propTypes = propTypes;

export default GrowlNotificationContainer;
