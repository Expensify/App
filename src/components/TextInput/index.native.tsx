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
            {...props}
            ref={ref}
            inputStyle={[styles.baseTextInput, props.inputStyle]}
            textInputContainerStyles={[props.textInputContainerStyles]}
        />
    );
}

// No-op on native — keyboard restoration is only needed on mobile Chrome (web)
function getIsRestoringKeyboardFocus() {
    return false;
}

export default TextInput;
export {getIsRestoringKeyboardFocus};
