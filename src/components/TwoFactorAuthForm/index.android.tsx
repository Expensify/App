import CONST from '@src/CONST';

import React from 'react';

import type {TwoFactorAuthFormProps} from './types';

import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

function TwoFactorAuthForm(props: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            autoComplete={CONST.AUTO_COMPLETE_VARIANTS.SMS_OTP}
            {...props}
        />
    );
}

export default TwoFactorAuthForm;
