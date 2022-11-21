import React from 'react';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import CONST from '../CONST';
import styles from '../styles/styles';

const propTypes = {
    /** Children to wrap in AnimatedStep. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    /** Whether we're animating the step in or out */
    direction: PropTypes.oneOf(['in', 'out']),
};

const defaultProps = {
    direction: 'in',
    style: [],
};

const AnimatedStep = (props) => {
    function getAnimationStyle(direction) {
        let animationStyle;

        if (direction === 'in') {
            animationStyle = styles.makeSlideInTranslation('translateX', CONST.ANIMATED_TRANSITION_FROM_VALUE);
        } else if (direction === 'out') {
            animationStyle = styles.makeSlideInTranslation('translateX', -CONST.ANIMATED_TRANSITION_FROM_VALUE);
        }
        return animationStyle;
    }

    return (
        <Animatable.View
            duration={CONST.ANIMATED_TRANSITION}
            animation={getAnimationStyle(props.direction)}
            useNativeDriver
            style={props.style}
        >
            {props.children}
        </Animatable.View>
    );
};

AnimatedStep.propTypes = propTypes;
AnimatedStep.defaultProps = defaultProps;
AnimatedStep.displayName = 'AnimatedStep';
export default AnimatedStep;
