import React, {forwardRef} from 'react';
import styles from '../../styles/styles';
import BaseExpensiTextInput from './BaseExpensiTextInput';
import {propTypes, defaultProps} from './baseExpensiTextInputPropTypes';

const ExpensiTextInput = forwardRef((props, ref) => (
    <BaseExpensiTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType}
        innerRef={ref}
        inputStyle={[styles.expensiTextInput]}
    />
));

ExpensiTextInput.propTypes = propTypes;
ExpensiTextInput.defaultProps = defaultProps;
ExpensiTextInput.displayName = 'ExpensiTextInput';

export default ExpensiTextInput;
