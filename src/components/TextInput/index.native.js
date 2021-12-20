import React, {forwardRef} from 'react';
import styles from '../../styles/styles';
import BaseTextInput from './BaseTextInput';
import {propTypes, defaultProps} from './baseTextInputPropTypes';

const TextInput = forwardRef((props, ref) => (
    <BaseTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
        innerRef={ref}
        inputStyle={[styles.textInput]}
    />
));

TextInput.propTypes = propTypes;
TextInput.defaultProps = defaultProps;
TextInput.displayName = 'TextInput';

export default TextInput;
