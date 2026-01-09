import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm({innerRef, validateInsteadOfDisable, shouldAutoFocusOnMobile, step}: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="sms-otp"
            validateInsteadOfDisable={validateInsteadOfDisable}
            shouldAutoFocusOnMobile={shouldAutoFocusOnMobile}
            step={step}
        />
    );
}

export default TwoFactorAuthForm;
