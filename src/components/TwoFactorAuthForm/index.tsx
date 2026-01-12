import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';
import type {TwoFactorAuthFormProps} from './types';

function TwoFactorAuthForm(props: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            autoComplete="one-time-code"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default TwoFactorAuthForm;
