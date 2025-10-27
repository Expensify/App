/*
 * The KeyboardAvoidingView stub implementation for web and other platforms where the keyboard is handled automatically.
 */
import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {KeyboardAvoidingViewProps} from '@components/KeyboardAvoidingView/types';
import {isMobileSafariOnIos26} from '@libs/Browser';
import CONST from '@src/CONST';

const isMobileSafariIos26 = isMobileSafariOnIos26();

const initialViewportHeight = window?.visualViewport?.height;

function BaseKeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    const {behavior, contentContainerStyle, enabled, keyboardVerticalOffset, style, ...rest} = props;
    const sharedValue = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {paddingBottom: sharedValue.get() * 30}; //testing
    });

    useEffect(() => {
        if (!isMobileSafariIos26) {
            return;
        }

        let isTiming = false;
        const handler = (isActive: boolean) => {
            if (isTiming) {
                return;
            }
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
        const handleResize = () => {
            const viewportHeight = window?.visualViewport?.height;

            if (!viewportHeight || !initialViewportHeight) {
                return;
            }

            const isVisible = initialViewportHeight - viewportHeight > CONST.SMART_BANNER_HEIGHT;
            handler(isVisible);
        };

        window.visualViewport?.addEventListener('resize', handleResize);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, [sharedValue]);

    return (
        <Animated.View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            style={[style, isMobileSafariIos26 && animatedStyle]}
        />
    );
}

BaseKeyboardAvoidingView.displayName = 'BaseKeyboardAvoidingView';

export default BaseKeyboardAvoidingView;
