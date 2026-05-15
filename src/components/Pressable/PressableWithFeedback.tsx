import React, {useState} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import OpacityView from '@components/OpacityView';
import type {Color} from '@styles/theme/types';
import variables from '@styles/variables';
import GenericPressable from './GenericPressable';
import type PressableProps from './GenericPressable/types';
import usePressResponderProps from './PressResponder/usePressResponderProps';
import useResponderRef from './PressResponder/useResponderRef';

type PressableWithFeedbackProps = PressableProps & {
    /** Style for the wrapper view */
    wrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /**
     * Determines what opacity value should be applied to the underlying view when Pressable is pressed.
     * To disable dimming, pass 1 as pressDimmingValue
     * @default variables.pressDimValue
     */
    pressDimmingValue?: number;

    /**
     * Determines what opacity value should be applied to the underlying view when pressable is hovered.
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

    /**
     * Whether the button should have a background layer in the color of theme.appBG.
     * This is needed for buttons that allow content to display under them.
     */
    shouldBlendOpacity?: boolean;

    /** Optional callback fired on wrapper's mount and layout changes */
    onWrapperLayout?: ((event: LayoutChangeEvent) => void) | undefined;
};

function PressableWithFeedback({
    children,
    wrapperStyle = [],
    needsOffscreenAlphaCompositing = false,
    pressDimmingValue = variables.pressDimValue,
    hoverDimmingValue = variables.hoverDimValue,
    dimAnimationDuration,
    shouldBlendOpacity,
    ref,
    onWrapperLayout,
    ...rest
}: PressableWithFeedbackProps) {
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const mergedRef = useResponderRef(ref);
    const slot = usePressResponderProps({
        onPress: rest.onPress,
        accessibilityState: rest.accessibilityState,
        accessibilityHasPopup: rest.accessibilityHasPopup,
        nativeID: rest.nativeID,
        accessibilityControls: rest.accessibilityControls,
    });

    return (
        <OpacityView
            shouldDim={!shouldBlendOpacity && !!(!rest.disabled && (isPressed || isHovered))}
            dimmingValue={isPressed ? pressDimmingValue : hoverDimmingValue}
            dimAnimationDuration={dimAnimationDuration}
            style={wrapperStyle}
            onLayout={onWrapperLayout}
            needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
        >
            <GenericPressable
                {...rest}
                ref={mergedRef}
                onPress={slot.onPress}
                accessibilityState={slot.accessibilityState}
                accessibilityHasPopup={slot.accessibilityHasPopup}
                nativeID={slot.nativeID}
                accessibilityControls={slot.accessibilityControls}
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

export default PressableWithFeedback;
export type {PressableWithFeedbackProps};
