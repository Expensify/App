import React, {forwardRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import OpacityView from '@components/OpacityView';
import type {Color} from '@styles/theme/types';
import variables from '@styles/variables';
import GenericPressable from './GenericPressable';
import type {PressableRef} from './GenericPressable/types';
import type PressableProps from './GenericPressable/types';

type PressableWithFeedbackProps = PressableProps & {
    /** Style for the wrapper view */
    wrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /**
     * Determines what opacity value should be applied to the underlaying view when Pressable is pressed.
     * To disable dimming, pass 1 as pressDimmingValue
     * @default variables.pressDimValue
     */
    pressDimmingValue?: number;

    /**
     * Determines what opacity value should be applied to the underlaying view when pressable is hovered.
     * To disable dimming, pass 1 as hoverDimmingValue
     * @default variables.hoverDimValue
     */
    hoverDimmingValue?: number;

    /**
     * The duration of the dimming animation
     * @default variables.dimAnimationDuration
     */
    dimAnimationDuration?: number;

    /** Whether the view needs to be rendered offscreen (for Android only) */
    needsOffscreenAlphaCompositing?: boolean;

    /** The color of the underlay that will show through when the Pressable is active. */
    underlayColor?: Color;
};

function PressableWithFeedback(
    {
        children,
        wrapperStyle = [],
        needsOffscreenAlphaCompositing = false,
        pressDimmingValue = variables.pressDimValue,
        hoverDimmingValue = variables.hoverDimValue,
        dimAnimationDuration,
        ...rest
    }: PressableWithFeedbackProps,
    ref: PressableRef,
) {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <OpacityView
            shouldDim={!!(!rest.disabled && (isPressed || isHovered))}
            dimmingValue={isPressed ? pressDimmingValue : hoverDimmingValue}
            dimAnimationDuration={dimAnimationDuration}
            style={wrapperStyle}
            needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
        >
            <GenericPressable
                ref={ref}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                disabled={rest.disabled}
                onHoverIn={(event) => {
                    setIsHovered(true);
                    if (rest.onHoverIn) {
                        rest.onHoverIn(event);
                    }
                }}
                onHoverOut={(event) => {
                    setIsHovered(false);
                    if (rest.onHoverOut) {
                        rest.onHoverOut(event);
                    }
                }}
                onPressIn={(event) => {
                    setIsPressed(true);
                    if (rest.onPressIn) {
                        rest.onPressIn(event);
                    }
                }}
                onPressOut={(event) => {
                    setIsPressed(false);
                    if (rest.onPressOut) {
                        rest.onPressOut(event);
                    }
                }}
            >
                {(state) => (typeof children === 'function' ? children(state) : children)}
            </GenericPressable>
        </OpacityView>
    );
}

PressableWithFeedback.displayName = 'PressableWithFeedback';

export default forwardRef(PressableWithFeedback);
export type {PressableWithFeedbackProps};
