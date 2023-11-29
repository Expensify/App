import React, {forwardRef, useEffect} from 'react';
import {AppState, Keyboard} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './BaseTextInput/baseTextInputPropTypes';

const TextInput = forwardRef((props, ref) => {
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
            // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
            innerRef={ref}
            inputStyle={[styles.baseTextInput, ...props.inputStyle]}
        />
    );
});

TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;
TextInput.displayName = 'TextInput';

export default TextInput;
