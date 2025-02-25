import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useExitingAnimation from '@hooks/useExitingAnimation';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const Exiting = useExitingAnimation(height);

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
            exiting={shouldAnimateOnRemove ? Exiting : undefined}
            onLayout={(e) => {
                setHeight(e.nativeEvent.layout.height);
            }}
        >
            {children}
        </Animated.View>
    );
}

OpacityView.displayName = 'OpacityView';
export default OpacityView;
