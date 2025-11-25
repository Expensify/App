import React from 'react';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type {ValidateCodeFormProps} from './BaseValidateCodeForm';

function ValidateCodeForm(props: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete="one-time-code"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default ValidateCodeForm;
