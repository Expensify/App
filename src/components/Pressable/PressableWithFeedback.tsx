import React, {ForwardedRef, forwardRef, useState} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {AnimatedStyle} from 'react-native-reanimated';
import OpacityView from '@components/OpacityView';
import variables from '@styles/variables';
import GenericPressable from './GenericPressable';
import PressableProps from './GenericPressable/types';

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

    /** Whether the view needs to be rendered offscreen (for Android only) */
    needsOffscreenAlphaCompositing?: boolean;
};

function PressableWithFeedback(
    {
        children,
        wrapperStyle = [],
        needsOffscreenAlphaCompositing = false,
        pressDimmingValue = variables.pressDimValue,
        hoverDimmingValue = variables.hoverDimValue,
        ...rest
    }: PressableWithFeedbackProps,
    ref: ForwardedRef<View>,
) {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <OpacityView
            shouldDim={Boolean(!rest.disabled && (isPressed || isHovered))}
            dimmingValue={isPressed ? pressDimmingValue : hoverDimmingValue}
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
