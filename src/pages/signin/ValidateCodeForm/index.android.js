import React from 'react';
import PropTypes from 'prop-types';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const defaultProps = {
    isVisible: false,
};

const propTypes = {
    isVisible: PropTypes.bool,
};
function ValidateCodeForm(props) {
    return (
        <BaseValidateCodeForm
            isVisible={props.isVisible}
            autoComplete="sms-otp"
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
