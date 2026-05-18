import React from 'react';
import CONST from '@src/CONST';
import BaseValidateCodeForm from './BaseValidateCodeForm';
import type ValidateCodeFormProps from './types';

function ValidateCodeForm({ref, ...props}: ValidateCodeFormProps) {
    return (
        <BaseValidateCodeForm
            autoComplete={CONST.AUTO_COMPLETE_VARIANTS.SMS_OTP}
            ref={ref}
            {...props}
        />
    );
}

ValidateCodeForm.displayName = 'SignInValidateCodeForm';

export default ValidateCodeForm;
