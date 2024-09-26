import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect} from 'react';
import {AppState, Keyboard} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseTextInput from './BaseTextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './BaseTextInput/types';

function TextInput(props: BaseTextInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const styles = useThemeStyles();

    useEffect(() => {
        if (!props.disableKeyboard) {
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
    }, [props.disableKeyboard]);

    return (
        <BaseTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            inputStyle={[styles.baseTextInput, props.inputStyle]}
        />
    );
}

TextInput.displayName = 'TextInput';

export default forwardRef(TextInput);
