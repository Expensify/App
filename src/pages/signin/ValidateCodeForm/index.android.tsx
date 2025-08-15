import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type ValidateCodeFormProps from './types';

function ValidateCodeForm({ref, ...props}: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete="sms-otp"
            ref={ref}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'ValidateCodeForm';

export default ValidateCodeForm;
