import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

function TwoFactorAuthForm() {
    return <BaseTwoFactorAuthForm autoComplete="sms-otp" />;
}

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
