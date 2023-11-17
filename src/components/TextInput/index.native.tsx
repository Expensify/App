import React, {Component, ForwardedRef, forwardRef, useEffect} from 'react';
import {AppState, Keyboard, TextInputProps} from 'react-native';
import {AnimatedProps} from 'react-native-reanimated';
import styles from '@styles/styles';
import BaseTextInput from './BaseTextInput';
import BaseTextInputProps from './BaseTextInput/types';

// eslint-disable-next-line react/function-component-definition
const TextInput = (
    {inputStyle, disableKeyboard = false, prefixCharacter, inputID, ...props}: BaseTextInputProps,
    ref: ForwardedRef<HTMLFormElement | Component<AnimatedProps<TextInputProps>, unknown, unknown>>,
) => {
    useEffect(() => {
        if (!disableKeyboard) {
            return;
        }

        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (!nextAppState.match(/inactive|background/)) {
                return;
            }

            Keyboard.dismiss();
        });

        return () => {
            appStateSubscription.remove();
        };
    }, [disableKeyboard]);
    return (
        <BaseTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
            ref={ref}
            inputStyle={[styles.baseTextInput, inputStyle]}
        />
    );
};

// TextInput.propTypes = baseTextInputPropTypes.propTypes;
// TextInput.defaultProps = baseTextInputPropTypes.defaultProps;
TextInput.displayName = 'TextInput';

export default forwardRef(TextInput);
