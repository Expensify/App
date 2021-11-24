import React, {forwardRef} from 'react';
import styles from '../../styles/styles';
import BaseExpensiTextInput from './BaseExpensiTextInput';
import {propTypes, defaultProps} from './baseExpensiTextInputPropTypes';

const ExpensiTextInput = forwardRef((props, ref) => (
    <BaseExpensiTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
        inputStyle={[styles.expensiTextInput, styles.expensiTextInputDesktop]}
    />
));

ExpensiTextInput.propTypes = propTypes;
ExpensiTextInput.defaultProps = defaultProps;
ExpensiTextInput.displayName = 'ExpensiTextInput';

export default ExpensiTextInput;
