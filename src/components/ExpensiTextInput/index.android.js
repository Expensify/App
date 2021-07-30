import React from 'react';
import styles from '../../styles/styles';
import ExpensiTextInput from './index.ios';
import {propTypes, defaultProps} from './propTypes';

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

ExpensiTextInputAndroid.propTypes = propTypes;
ExpensiTextInputAndroid.defaultProps = defaultProps;
ExpensiTextInputAndroid.displayName = 'ExpensiTextInput';

export default ExpensiTextInputAndroid;
