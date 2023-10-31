import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import * as Animatable from 'react-native-animatable';
import useNativeDriver from '@libs/useNativeDriver';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Children to wrap in AnimatedStep. */
    children: PropTypes.node.isRequired,

    /** Styles to be assigned to Container */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),

    /** Whether we're animating the step in or out */
    direction: PropTypes.oneOf(['in', 'out']),

    /** Callback to fire when the animation ends */
    onAnimationEnd: PropTypes.func,
};

const defaultProps = {
    direction: 'in',
    style: [],
    onAnimationEnd: () => {},
};

function AnimatedStep(props) {
    const styles = useThemeStyles();
    const animation = useMemo(() => {
        let transitionValue;

        if (props.direction === 'in') {
            transitionValue = CONST.ANIMATED_TRANSITION_FROM_VALUE;
        } else if (props.direction === 'out') {
            transitionValue = -CONST.ANIMATED_TRANSITION_FROM_VALUE;
        }
        return styles.makeSlideInTranslation('translateX', transitionValue);
    }, [props.direction, styles]);
    return (
        <Animatable.View
            onAnimationEnd={() => {
                if (!props.onAnimationEnd) {
                    return;
                }
                props.onAnimationEnd();
            }}
            duration={CONST.ANIMATED_TRANSITION}
            animation={animation}
            useNativeDriver={useNativeDriver}
            style={props.style}
        >
            {props.children}
        </Animatable.View>
    );
}

AnimatedStep.propTypes = propTypes;
AnimatedStep.defaultProps = defaultProps;
AnimatedStep.displayName = 'AnimatedStep';

export default AnimatedStep;
