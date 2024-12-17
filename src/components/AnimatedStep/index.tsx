import React, {useEffect, useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {AnimationDirection} from './AnimatedStepContext';

type AnimatedStepProps = ChildrenProps & {
    /** Styles to be assigned to Container */
    style: StyleProp<ViewStyle>;

    /** Whether we're animating the step in or out */
    direction: AnimationDirection;

    /** Callback to fire when the animation ends */
    onAnimationEnd?: () => void;
};

function AnimatedStep({onAnimationEnd, direction = CONST.ANIMATION_DIRECTION.IN, style, children}: AnimatedStepProps) {
    const sharedTranslateX = useSharedValue(0);
    const transitionValue = useMemo(() => (direction === 'in' ? CONST.ANIMATED_TRANSITION_FROM_VALUE : -CONST.ANIMATED_TRANSITION_FROM_VALUE), [direction]);

    useEffect(() => {
        sharedTranslateX.set(withTiming(0, {duration: CONST.ANIMATED_TRANSITION}, onAnimationEnd));
    }, [sharedTranslateX, transitionValue, onAnimationEnd]);

    // Animated style for the reanimated component
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: sharedTranslateX.get()}],
    }));

    return (
        <Animated.View
            style={[style, animatedStyle]} // Combine external style and animation style
        >
            {children}
        </Animated.View>
    );
}

AnimatedStep.displayName = 'AnimatedStep';
export default AnimatedStep;
