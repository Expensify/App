import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import * as Animatable from 'react-native-animatable';
import useThemeStyles from '@hooks/useThemeStyles';
import useNativeDriver from '@libs/useNativeDriver';
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
            // eslint-disable-next-line react-compiler/react-compiler
            useNativeDriver={useNativeDriver}
            style={style}
        >
            {children}
        </Animatable.View>
    );
}

AnimatedStep.displayName = 'AnimatedStep';
export default AnimatedStep;
