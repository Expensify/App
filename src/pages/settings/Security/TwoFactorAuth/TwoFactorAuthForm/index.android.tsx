import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm({innerRef, validateInsteadOfDisable, shouldAutoFocusOnMobile}: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="sms-otp"
            validateInsteadOfDisable={validateInsteadOfDisable}
            shouldAutoFocusOnMobile={shouldAutoFocusOnMobile}
        />
    );
}

export default TwoFactorAuthForm;
