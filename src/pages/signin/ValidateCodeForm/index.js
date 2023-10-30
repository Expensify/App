import React from 'react';
import PropTypes from 'prop-types';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const defaultProps = {};

const propTypes = {
    /** Determines if user is switched to using recovery code instead of 2fa code */
    isUsingRecoveryCode: PropTypes.bool.isRequired,

    /** Function to change `isUsingRecoveryCode` state when user toggles between 2fa code and recovery code */
    setIsUsingRecoveryCode: PropTypes.func.isRequired,
};
function ValidateCodeForm(props) {
    return (
        <BaseValidateCodeForm
            autoComplete="one-time-code"
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
