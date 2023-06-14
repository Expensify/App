import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

function TwoFactorAuthForm() {
    return <BaseTwoFactorAuthForm autoComplete="one-time-code" />;
}

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
