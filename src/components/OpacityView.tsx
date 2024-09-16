import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';
import variables from '@styles/variables';

type OpacityViewProps = {
    /** Should we dim the view */
    shouldDim: boolean;

    /** Content to render */
    children: React.ReactNode;

    /**
     * Array of style objects
     * @default []
     */
    style?: StyleProp<AnimatedStyle<ViewStyle>>;

    /**
     * The value to use for the opacity when the view is dimmed
     * @default variables.hoverDimValue
     */
    dimmingValue?: number;

    /**
     * The duration of the dimming animation
     * @default variables.dimAnimationDuration
     */
    dimAnimationDuration?: number;

    /** Whether the view needs to be rendered offscreen (for Android only) */
    needsOffscreenAlphaCompositing?: boolean;
};

function OpacityView({
    shouldDim,
    dimAnimationDuration = variables.dimAnimationDuration,
    children,
    style = [],
    dimmingValue = variables.hoverDimValue,
    needsOffscreenAlphaCompositing = false,
}: OpacityViewProps) {
    const opacity = useSharedValue(1);
    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    React.useEffect(() => {
        if (shouldDim) {
            // eslint-disable-next-line react-compiler/react-compiler
            opacity.value = withTiming(dimmingValue, {duration: dimAnimationDuration});
        } else {
            opacity.value = withTiming(1, {duration: dimAnimationDuration});
        }
    }, [shouldDim, dimmingValue, opacity, dimAnimationDuration]);

    return (
        <Animated.View
            style={[opacityStyle, style]}
            needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOffscreenAlphaCompositing : undefined}
        >
            {children}
        </Animated.View>
    );
}

OpacityView.displayName = 'OpacityView';
export default OpacityView;
