import React, {forwardRef, useEffect} from 'react';
import {AppState, Keyboard} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import BaseTextInput from './BaseTextInput';
import BaseTextInputProps, {BaseTextInputRef} from './BaseTextInput/types';

// eslint-disable-next-line react/function-component-definition
const TextInput = ({inputStyle, disableKeyboard = false, prefixCharacter, inputID, ...props}: BaseTextInputProps, ref: BaseTextInputRef) => {
    const styles = useThemeStyles();

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

TextInput.displayName = 'TextInput';

export default forwardRef(TextInput);
