import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type ValidateCodeFormProps from './types';

function ValidateCodeForm({ref, ...props}: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete="one-time-code"
            ref={ref}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'SignInValidateCodeForm';

export default ValidateCodeForm;
