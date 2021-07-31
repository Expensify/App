import React from 'react';
import styles from '../../styles/styles';
import BaseExpensiTextInput from './BaseExpensiTextInput';
import {propTypes, defaultProps} from './propTypes';

const ExpensiTextInput = ({
    androidStyles,
    translateX,
    ...props
}) => (
    <BaseExpensiTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        inputStyle={[
            styles.expensiTextInput,
            styles.expensiTextInputAndroid(Math.abs(translateX)),
        ]}
        translateX={translateX}
    />
);

ExpensiTextInput.propTypes = propTypes;
ExpensiTextInput.defaultProps = defaultProps;
ExpensiTextInput.displayName = 'ExpensiTextInput';

export default ExpensiTextInput;
