import type {ForwardedRef} from 'react';
import React, {useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Role, Text, View} from 'react-native';
import Animated, {Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {Path} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import Icon from './Icon';
import {ReceiptPlus} from './Icon/Expensicons';
import {PressableWithoutFeedback} from './Pressable';

const AnimatedPath = Animated.createAnimatedComponent(Path);
AnimatedPath.displayName = 'AnimatedPath';

type FloatingReceiptButtonProps = {
    /* Callback to fire on request to toggle the FloatingReceiptButton */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* Callback to fire on long press of the FloatingReceiptButton */
    onLongPress?: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* Current state (active or not active) of the component */
    isActive: boolean;

    /* An accessibility label for the button */
    accessibilityLabel: string;

    /* An accessibility role for the button */
    role: Role;

    /** Reference to the outer element */
    ref?: ForwardedRef<HTMLDivElement | View | Text>;
};

function FloatingReceiptButton({onPress, onLongPress, isActive, accessibilityLabel, role, ref}: FloatingReceiptButtonProps) {
    const {success, successHover, buttonDefaultBG, textLight} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const fabPressable = useRef<HTMLDivElement | View | Text | null>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isLHBVisible = !shouldUseNarrowLayout;

    const fabSize = isLHBVisible ? variables.iconSizeSmall : variables.iconSizeNormal;

    const sharedValue = useSharedValue(isActive ? 1 : 0);
    const buttonRef = ref;

    useEffect(() => {
        sharedValue.set(
            withTiming(isActive ? 1 : 0, {
                duration: 340,
                easing: Easing.inOut(Easing.ease),
            }),
        );
    }, [isActive, sharedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(sharedValue.get(), [0, 1], [success, buttonDefaultBG]);

        return {
            transform: [{rotate: `${sharedValue.get() * 135}deg`}],
            backgroundColor,
        };
    });

    const toggleFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onPress(event);
    };

    const longPressFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        // Only execute on narrow layout - prevent event from firing on wide screens
        if (isLHBVisible) {
            return;
        }
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onLongPress?.(event);
    };

    return (
        <PressableWithoutFeedback
            ref={(el) => {
                fabPressable.current = el ?? null;
                if (buttonRef && 'current' in buttonRef) {
                    buttonRef.current = el ?? null;
                }
            }}
            style={[
                // styles.h100,
                styles.navigationTabBarFABItem,

                // Prevent text selection on touch devices (e.g. on long press)
                canUseTouchScreen() && styles.userSelectNone,
            ]}
            accessibilityLabel={accessibilityLabel}
            onPress={toggleFabAction}
            onLongPress={longPressFabAction}
            role={role}
            shouldUseHapticsOnLongPress
            testID="floating-action-button"
        >
            {({hovered}) => (
                <Animated.View
                    style={[styles.floatingActionButton, {borderRadius}, isLHBVisible && styles.floatingActionButtonSmall, animatedStyle, hovered && {backgroundColor: successHover}]}
                    testID="fab-animated-container"
                >
                    <Icon
                        fill={textLight}
                        src={ReceiptPlus}
                        width={fabSize}
                        height={fabSize}
                    />
                </Animated.View>
            )}
        </PressableWithoutFeedback>
    );
}

FloatingReceiptButton.displayName = 'FloatingReceiptButton';

export default FloatingReceiptButton;
