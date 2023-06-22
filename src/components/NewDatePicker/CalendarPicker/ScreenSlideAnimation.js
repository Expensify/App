import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {SlideInRight, SlideOutLeft} from 'react-native-reanimated';

const propTypes = {
    /** Children to render */
    children: PropTypes.node.isRequired,
};

function ScreenSlideAnimation({children}) {
    return (
        <Animated.View
            key="yearPicker"
            entering={SlideInRight}
            exiting={SlideOutLeft}
            style={StyleSheet.absoluteFillObject}
        >
            {children}
        </Animated.View>
    );
}

ScreenSlideAnimation.displayName = 'ScreenSlideAnimation';
ScreenSlideAnimation.propTypes = propTypes;

export default ScreenSlideAnimation;
