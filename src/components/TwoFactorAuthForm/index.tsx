import React from 'react';

import type {TwoFactorAuthFormProps} from './types';

import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

function TwoFactorAuthForm(props: TwoFactorAuthFormProps) {
    return <BaseTwoFactorAuthForm {...props} />;
}

export default TwoFactorAuthForm;
