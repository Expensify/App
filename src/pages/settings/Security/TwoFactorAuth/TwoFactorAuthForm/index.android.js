import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

const TwoFactorAuthForm = () => <BaseTwoFactorAuthForm autoComplete="sms-otp" />;

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
