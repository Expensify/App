import React, { useMemo } from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import Animated, {Easing, Keyframe, LayoutAnimationConfig, SequencedTransition, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';
import variables from '@styles/variables';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();


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

    shouldAnimate?: boolean;
};

function OpacityView({
    shouldDim,
    dimAnimationDuration = variables.dimAnimationDuration,
    children,
    style = [],
    dimmingValue = variables.hoverDimValue,
    needsOffscreenAlphaCompositing = false,
    shouldAnimate = false,
}: OpacityViewProps) {
    const opacity = useSharedValue(1);
    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
    }));

    React.useEffect(() => {
        opacity.set(withTiming(shouldDim ? dimmingValue : 1, {duration: dimAnimationDuration}));
    }, [shouldDim, dimmingValue, opacity, dimAnimationDuration]);

    const Exiting = useMemo(() => {
        const SlideOut = new Keyframe({
            from: {
                opacity: 1,
                transform: [{translateY: 0}],
            },
            to: {
                height: 0,
                opacity: 0,
                transform: [{translateY: 0}],
                easing,
            },
        });

        return SlideOut.duration(300);
    }, []);
    

    return (
        <LayoutAnimationConfig skipEntering>
            <Animated.View
                style={[opacityStyle, style]}
                exiting={shouldAnimate ? Exiting : undefined}
                layout={shouldAnimate ? SequencedTransition : undefined}
                needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOffscreenAlphaCompositing : undefined}
            >
                {children}
            </Animated.View>
        </LayoutAnimationConfig>
    );
}

OpacityView.displayName = 'OpacityView';
export default OpacityView;
