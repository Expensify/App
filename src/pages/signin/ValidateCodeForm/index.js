import React from 'react';
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
            autoComplete="one-time-code"
            isInModal={props.isInModal}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';
ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default ValidateCodeForm;
