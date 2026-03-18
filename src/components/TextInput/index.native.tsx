import React, {useEffect} from 'react';
import {AppState, Keyboard} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import Log from '@libs/Log';
import BaseTextInput from './BaseTextInput';
import type {BaseTextInputProps} from './BaseTextInput/types';

function TextInput({ref, navigation, ...props}: BaseTextInputProps) {
    const styles = useThemeStyles();

    useEffect(() => {
        if (!props.disableKeyboard) {
            return;
        }

        if (!navigation) {
            Log.warn('disableKeyboard is enabled, but "navigation" isn\'t passed to the TextInput component!');
        }

        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (!nextAppState.match(/inactive|background/) || (navigation && !navigation.isFocused())) {
                return;
            }

            Keyboard.dismiss();
        });

        return () => {
            appStateSubscription.remove();
        };
    }, [props.disableKeyboard, navigation]);

    return (
        <BaseTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            ref={ref}
            autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
            inputStyle={[styles.baseTextInput, props.inputStyle]}
            textInputContainerStyles={[props.textInputContainerStyles]}
        />
    );
}

export default TextInput;
