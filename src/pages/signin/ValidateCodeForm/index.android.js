import React from 'react';
import PropTypes from 'prop-types';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const defaultProps = {
    isVisible: false,
    isAnonymousUser: false,
};

const propTypes = {
    isVisible: PropTypes.bool,
    isAnonymousUser: PropTypes.bool,
};
const ValidateCodeForm = (props) => (
    <BaseValidateCodeForm
        isVisible={props.isVisible}
        autoComplete="sms-otp"
        isAnonymousUser={props.isAnonymousUser}
    />
);

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
