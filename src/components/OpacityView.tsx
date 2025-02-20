import React, {useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import Animated, {Easing, Keyframe, LinearTransition, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';
import variables from '@styles/variables';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

/**
 * Due to issues with react-native-reanimated Keyframes the easing type doesn't account for bezier functions
 * and we also need to use internal .build() function to make the easing apply on each mount.
 *
 * This causes problems with both eslint & Typescript and is going to be fixed in react-native-reanimated 3.17 with these PRs merged:
 * https://github.com/software-mansion/react-native-reanimated/pull/6960
 * https://github.com/software-mansion/react-native-reanimated/pull/6958
 *
 * Once that's added we can apply our changes to files in BottomDockedModal/Backdrop/*.tsx and BottomDockedModal/Container/*.tsx
 */

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

    shouldAnimateOnRemove?: boolean;
};

function OpacityView({
    shouldDim,
    dimAnimationDuration = variables.dimAnimationDuration,
    children,
    style = [],
    dimmingValue = variables.hoverDimValue,
    needsOffscreenAlphaCompositing = false,
    shouldAnimateOnRemove,
}: OpacityViewProps) {
    const opacity = useSharedValue(1);
    const styles = useThemeStyles();
    const [height, setHeight] = useState(0);
    const SlideOut = useMemo(() => {
        return new Keyframe({
            from: {
                height,
            },
            to: {
                height: '0',
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
                easing,
            },
        });
    }, [height]);

    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
    }));

    React.useEffect(() => {
        opacity.set(withTiming(shouldDim ? dimmingValue : 1, {duration: dimAnimationDuration}));
    }, [shouldDim, dimmingValue, opacity, dimAnimationDuration]);

    return (
        <Animated.View
            style={[opacityStyle, style, shouldAnimateOnRemove && styles.overflowHidden]}
            needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOffscreenAlphaCompositing : undefined}
            exiting={shouldAnimateOnRemove ? SlideOut.duration(300) : undefined}
            onLayout={(e) => {
                setHeight(e.nativeEvent.layout.height);
            }}
            layout={shouldAnimateOnRemove ? LinearTransition : undefined}
        >
            {children}
        </Animated.View>
    );
}

OpacityView.displayName = 'OpacityView';
export default OpacityView;
