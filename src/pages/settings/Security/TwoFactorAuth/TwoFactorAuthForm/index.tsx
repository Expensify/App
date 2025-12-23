import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm({innerRef, validateInsteadOfDisable, onFocus, shouldAutoFocusOnMobile}: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="one-time-code"
            validateInsteadOfDisable={validateInsteadOfDisable}
            onFocus={onFocus}
            shouldAutoFocusOnMobile={shouldAutoFocusOnMobile}
        />
    );
}

export default TwoFactorAuthForm;
