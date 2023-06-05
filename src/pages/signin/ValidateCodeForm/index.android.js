import React from 'react';
import PropTypes from 'prop-types';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const defaultProps = {
    isVisible: false,
    isAnonymous: false,
};

const propTypes = {
    isVisible: PropTypes.bool,

    /** Whether the user is anonymous. True when opening the Sign-In Page from the modal */
    isAnonymous: PropTypes.bool,
};
const ValidateCodeForm = (props) => (
    <BaseValidateCodeForm
        isVisible={props.isVisible}
        autoComplete="sms-otp"
        isAnonymous={props.isAnonymous}
    />
);

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
