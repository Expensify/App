import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const defaultProps = {};

const propTypes = {};
function ValidateCodeForm() {
    return <BaseValidateCodeForm autoComplete="sms-otp" />;
}

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
