import React, {forwardRef} from 'react';
import styles from '../../styles/styles';
import BaseTextInput from './BaseTextInput';
import {propTypes, defaultProps} from './baseTextInputPropTypes';

const TextInput = forwardRef((props, ref) => (
    <BaseTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
        inputStyle={[styles.baseTextInput, styles.textInputDesktop]}
    />
));

TextInput.propTypes = propTypes;
TextInput.defaultProps = defaultProps;
TextInput.displayName = 'TextInput';

export default TextInput;
