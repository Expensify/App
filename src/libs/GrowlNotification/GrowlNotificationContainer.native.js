import React from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    children: PropTypes.node.isRequired,
    translateY: PropTypes.instanceOf(Animated.Value).isRequired,
};

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
