import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm(props: TwoFactorAuthFormProps) {
    return <BaseTwoFactorAuthForm {...props} />;
}

export default TwoFactorAuthForm;
