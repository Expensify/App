import CONST from '@src/CONST';

import React from 'react';

import type ValidateCodeFormProps from './types';

import BaseValidateCodeForm from './BaseValidateCodeForm';

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
