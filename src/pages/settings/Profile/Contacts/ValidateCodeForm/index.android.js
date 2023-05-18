import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';

const ValidateCodeForm = (props) => (
    <BaseValidateCodeForm
        autoComplete="sms-otp"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default ValidateCodeForm;
