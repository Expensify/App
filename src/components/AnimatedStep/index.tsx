import React, {useMemo} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import * as Animatable from 'react-native-animatable';
import useNativeDriver from '@libs/useNativeDriver';
import useThemeStyles from '@styles/useThemeStyles';
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

function AnimatedStep({onAnimationEnd, direction = CONST.ANIMATION_DIRECTION.IN, style, children}: AnimatedStepProps) {
    const styles = useThemeStyles();

    const animationStyle = useMemo(() => {
        const transitionValue = direction === 'in' ? CONST.ANIMATED_TRANSITION_FROM_VALUE : -CONST.ANIMATED_TRANSITION_FROM_VALUE;

        return styles.makeSlideInTranslation('translateX', transitionValue);
    }, [direction, styles]);

    return (
        <Animatable.View
            onAnimationEnd={() => {
                if (!onAnimationEnd) {
                    return;
                }
                onAnimationEnd();
            }}
            duration={CONST.ANIMATED_TRANSITION}
            animation={animationStyle}
            useNativeDriver={useNativeDriver}
            style={style}
        >
            {children}
        </Animatable.View>
    );
}

AnimatedStep.displayName = 'AnimatedStep';
export default AnimatedStep;
