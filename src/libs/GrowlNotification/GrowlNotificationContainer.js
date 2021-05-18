import React from 'react';
import {Animated} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';

const propTypes = {
    children: PropTypes.node.isRequired,
    translateY: PropTypes.instanceOf(Animated.Value).isRequired,
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

export default withWindowDimensions(GrowlNotificationContainer);
