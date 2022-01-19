import React, {forwardRef} from 'react';
import styles from '../../styles/styles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';

const TextInput = forwardRef((props, ref) => (
    <BaseTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
        innerRef={ref}

        // style added here to fix autofill background not filling to the bottom of the input
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        inputStyle={[styles.baseTextInput, styles.baseTextInputAndroidAutofillFix]}
    />
));

TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;
TextInput.displayName = 'TextInput';

export default TextInput;
