import React from 'react';
import * as Animatable from 'react-native-animatable';
import {StyleProp, ViewStyle} from 'react-native';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import useNativeDriver from '../../libs/useNativeDriver';
import {AnimationDirection} from './AnimatedStepContext';
import ChildrenProps from '../../types/utils/ChildrenProps';

type AnimatedStepProps = ChildrenProps & {
    /** Styles to be assigned to Container */
    style: StyleProp<ViewStyle>;

    /** Whether we're animating the step in or out */
    direction: AnimationDirection;

    /** Callback to fire when the animation ends */
    onAnimationEnd: () => void;
};

function getAnimationStyle(direction: AnimationDirection) {
    let transitionValue;

    if (direction === 'in') {
        transitionValue = CONST.ANIMATED_TRANSITION_FROM_VALUE;
    } else {
        transitionValue = -CONST.ANIMATED_TRANSITION_FROM_VALUE;
    }
    return styles.makeSlideInTranslation('translateX', transitionValue);
}

function AnimatedStep({onAnimationEnd, direction = CONST.ANIMATION_DIRECTION.IN, style = [], children}: AnimatedStepProps) {
    return (
        <Animatable.View
            onAnimationEnd={() => {
                if (!onAnimationEnd) {
                    return;
                }
                onAnimationEnd();
            }}
            duration={CONST.ANIMATED_TRANSITION}
            animation={getAnimationStyle(direction)}
            useNativeDriver={useNativeDriver}
            style={style}
        >
            {children}
        </Animatable.View>
    );
}

AnimatedStep.displayName = 'AnimatedStep';
export default AnimatedStep;
