import React from 'react';
import CONST from '@src/CONST';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm(props: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            autoComplete={CONST.AUTO_COMPLETE_VARIANTS.SMS_OTP}
            {...props}
        />
    );
}

export default TwoFactorAuthForm;
