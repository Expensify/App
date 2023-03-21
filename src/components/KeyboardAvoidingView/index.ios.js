/*
 * The KeyboardAvoidingView is only used on ios
 */
import React, {useMemo} from 'react';
import {
    StyleSheet,
    KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native';
import Reanimated, {KeyboardState, useAnimatedKeyboard, useAnimatedStyle} from 'react-native-reanimated';
import {makeRemote} from 'react-native-reanimated/src/reanimated2/core';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const KeyboardAvoidingView = (props) => {
    const behavior = props.behavior;

    const keyboard = useAnimatedKeyboard();
    const insets = useSafeAreaInsets();
    const ctx = useMemo(() => makeRemote({}), []);

    const animatedStyle = useAnimatedStyle(() => {
        let value = 0;

        // when we open modal keyboard is closed without animation and the height is 0
        // but when we close modal - it opens it again but for one frame the height is still 0
        if (keyboard.state.value === KeyboardState.OPEN && keyboard.height.value === 0) {
            value = ctx.keyboardLastValue - insets.bottom;
        } else if (keyboard.state.value === KeyboardState.CLOSED) {
            value = 0;
        } else {
            ctx.keyboardLastValue = keyboard.height.value;
            value = keyboard.height.value - insets.bottom;
        }

        if (behavior === 'height') {
            return {
                height: value,
                flex: 0,
            };
        }

        if (behavior === 'padding') {
            return {
                paddingBottom: value,
            };
        }

        if (behavior === 'position') {
            return {
                bottom: value,
            };
        }

        return {
        };
    });

    return (
        <Reanimated.View style={StyleSheet.compose(props.style, animatedStyle)}>
            {props.children}
        </Reanimated.View>
    );
};

KeyboardAvoidingView.propTypes = RNKeyboardAvoidingView.propTypes;

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
