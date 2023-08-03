import React from 'react';
import PropTypes from 'prop-types';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const defaultProps = {
    isInModal: false,
};

const propTypes = {
    isInModal: PropTypes.bool,
};
function ValidateCodeForm(props) {
    return (
        <BaseValidateCodeForm
            autoComplete="sms-otp"
            isInModal={props.isInModal}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
