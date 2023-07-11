import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';

function ValidateCodeForm(props) {
    return (
        <BaseValidateCodeForm
            autoComplete="sms-otp"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default ValidateCodeForm;
