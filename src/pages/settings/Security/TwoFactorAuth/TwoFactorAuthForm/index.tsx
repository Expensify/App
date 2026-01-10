import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm({innerRef, validateInsteadOfDisable, onFocus, shouldAutoFocusOnMobile, step}: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="one-time-code"
            validateInsteadOfDisable={validateInsteadOfDisable}
            onFocus={onFocus}
            shouldAutoFocusOnMobile={shouldAutoFocusOnMobile}
            step={step}
        />
    );
}

export default TwoFactorAuthForm;
