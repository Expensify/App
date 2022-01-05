import React, {forwardRef} from 'react';
import styles from '../../styles/styles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';

const TextInput = forwardRef((props, ref) => (
    <BaseTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
        inputStyle={[styles.baseTextInput, styles.textInputDesktop]}
    />
));

TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;
TextInput.displayName = 'TextInput';

export default TextInput;
