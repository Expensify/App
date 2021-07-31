import React from 'react';
import styles from '../../styles/styles';
import BaseExpensiTextInput from './BaseExpensiTextInput';
import {propTypes, defaultProps} from './propTypes';

const ExpensiTextInput = ({...props}) => (
    <BaseExpensiTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        inputStyle={[styles.expensiTextInput, styles.expensiTextInputDesktop]}
        ignoreLabelTranslateX
    />
);

ExpensiTextInput.propTypes = propTypes;
ExpensiTextInput.defaultProps = defaultProps;
ExpensiTextInput.displayName = 'ExpensiTextInput';

export default ExpensiTextInput;
