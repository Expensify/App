/*
 * The KeyboardAvoidingView stub implementation for web and other platforms where the keyboard is handled automatically.
 */
import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {KeyboardAvoidingViewProps} from '@components/KeyboardAvoidingView/types';
import {isMobileSafariOnIos26} from '@libs/Browser';
import KeyboardUtil from '@src/utils/keyboard';

const isMobileSafariIos26 = isMobileSafariOnIos26();

const BUBBLE_DOMAIN_HEIGHT_SAFARI_26 = 15;

function BaseKeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    const {behavior, contentContainerStyle, enabled, keyboardVerticalOffset, style, shouldDisableSafari26BubblePadding = false, ...rest} = props;
    const sharedValue = useSharedValue(0);

    // Skip the iOS 26 Safari bubble padding when the consumer opts out (e.g. bottom-docked modals where it would
    // expose the dimmed overlay between the content and the keyboard).
    const shouldApplyBubblePadding = isMobileSafariIos26 && !shouldDisableSafari26BubblePadding;

    const animatedStyle = useAnimatedStyle(() => {
        return {paddingBottom: sharedValue.get() * BUBBLE_DOMAIN_HEIGHT_SAFARI_26};
    });

    useEffect(() => {
        if (!shouldApplyBubblePadding) {
            return;
        }

        let isTiming = false;
        let prevIsActive = false;
        const handler = (isActive: boolean) => {
            if (isTiming && prevIsActive === isActive) {
                return;
            }
            isTiming = true;
            prevIsActive = isActive;
            sharedValue.set(
                withTiming(
                    isActive ? 1 : 0,
                    {
                        duration: 100,
                        easing: Easing.inOut(Easing.ease),
                    },
                    () => {
                        isTiming = false;
                    },
                ),
            );
        };

        return KeyboardUtil.subscribeKeyboardVisibilityChange(handler);
    }, [sharedValue, shouldApplyBubblePadding]);

    return (
        <Animated.View
            {...rest}
            style={[style, shouldApplyBubblePadding && animatedStyle]}
        />
    );
}

export default BaseKeyboardAvoidingView;
