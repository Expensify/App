/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {StyleSheet} from 'react-native';
import Reanimated, {KeyboardState, useAnimatedKeyboard, useAnimatedStyle} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const KeyboardAvoidingView = (props) => {
    const {behavior} = props;

    const keyboard = useAnimatedKeyboard();
    const insets = useSafeAreaInsets();

    const animatedStyle = useAnimatedStyle(() => {
        global.kav_lastKeyboardHeight = keyboard.state.value === KeyboardState.OPEN
          && keyboard.height.value !== 0
            ? keyboard.height.value
            : global.kav_lastKeyboardHeight;

        let value = 0;

        if (keyboard.state.value === KeyboardState.CLOSED) {
            value = 0;
        } else {
            value = keyboard.height.value - insets.bottom;

            if (keyboard.state.value === KeyboardState.OPEN) {
                value = global.kav_lastKeyboardHeight !== 0
                    ? global.kav_lastKeyboardHeight - insets.bottom
                    : 0;
            }
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

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
