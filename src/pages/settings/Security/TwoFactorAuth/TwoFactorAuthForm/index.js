import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

const TwoFactorAuthForm = () => <BaseTwoFactorAuthForm autoComplete="one-time-code" />;

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
