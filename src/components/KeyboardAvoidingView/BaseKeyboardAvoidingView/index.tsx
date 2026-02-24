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
    const {behavior, contentContainerStyle, enabled, keyboardVerticalOffset, style, ...rest} = props;
    const sharedValue = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {paddingBottom: sharedValue.get() * BUBBLE_DOMAIN_HEIGHT_SAFARI_26};
    });

    useEffect(() => {
        if (!isMobileSafariIos26) {
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
    }, [sharedValue]);

    return (
        <Animated.View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            style={[style, isMobileSafariIos26 && animatedStyle]}
        />
    );
}

export default BaseKeyboardAvoidingView;
