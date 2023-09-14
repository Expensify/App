import React, {forwardRef, useRef, useEffect} from 'react';
import _ from 'underscore';
import styles from '../../styles/styles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';

const TextInput = forwardRef((props, ref) => {
    const textInputRef = useRef(null);

    useEffect(() => {
        if (textInputRef.current && textInputRef.current.setSelection) {
            textInputRef.current.setSelection(0, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we want this effect to run only on mount
    }, []);

    return (
        <BaseTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
            innerRef={(el) => {
                textInputRef.current = el;
                if (!ref) {
                    return;
                }

                if (_.isFunction(ref)) {
                    ref(el);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                ref.current = el;
            }}
            inputStyle={[styles.baseTextInput, ...props.inputStyle]}
        />
    );
});

TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;
TextInput.displayName = 'TextInput';

export default TextInput;
