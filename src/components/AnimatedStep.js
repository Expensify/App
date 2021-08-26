import React from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import CONST from '../CONST';

const propTypes = {
    /** Children to wrap in AnimatedStep. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    style: PropTypes.arrayOf(PropTypes.object),

    /** Whether we're animating the step in or out */
    direction: PropTypes.string,
};

const defaultProps = {
    direction: undefined,
    style: [],
};

const AnimatedStep = (props) => {
    function getAnimationStyle(direction) {
        let animationStyle;

        if (direction === 'in') {
            animationStyle = 'slideInRight';
        } else if (direction === 'out') {
            animationStyle = 'slideInLeft';
        }
        return animationStyle;
    }

    return (
        <Animatable.View
            duration={CONST.ANIMATED_TRANSITION}
            animation={getAnimationStyle(props.direction)}
            useNativeDriver
            style={[...props.style]}
        >
            {props.children}
        </Animatable.View>
    );
};

AnimatedStep.propTypes = propTypes;
AnimatedStep.defaultProps = defaultProps;
AnimatedStep.displayName = 'AnimatedStep';
export default AnimatedStep;
