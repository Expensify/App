import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type ValidateCodeFormProps from './types';

function ValidateCodeForm(props: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete="sms-otp"
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default ValidateCodeForm;
