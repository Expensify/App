import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm({innerRef, validateInsteadOfDisable, shouldHandleScrollOnVirtualViewPort}: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="one-time-code"
            validateInsteadOfDisable={validateInsteadOfDisable}
            shouldHandleScrollOnVirtualViewPort={shouldHandleScrollOnVirtualViewPort}
        />
    );
}

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
