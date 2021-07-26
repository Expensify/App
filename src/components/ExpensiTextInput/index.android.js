import React from 'react';
import styles from '../../styles/styles';
import ExpensiTextInput from './index.ios';
import expensiTextInputPropTypes from './ExpensiTextInputPropTypes';
import expensiTextInputDefaultProps from './ExpensiTextInputDefaultProps';

const ExpensiTextInputAndroid = ({
    androidStyles,
    translateX,
    ...props
}) => (
    <ExpensiTextInput
        androidStyles={styles.expensiTextInputAndroid(Math.abs(translateX))}
        translateX={translateX}
            // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

ExpensiTextInputAndroid.propTypes = expensiTextInputPropTypes;
ExpensiTextInputAndroid.defaultProps = expensiTextInputDefaultProps;

export default ExpensiTextInputAndroid;
