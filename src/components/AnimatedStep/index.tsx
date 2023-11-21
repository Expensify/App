import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import * as Animatable from 'react-native-animatable';
import useNativeDriver from '@libs/useNativeDriver';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import {AnimationDirection} from './AnimatedStepContext';

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
