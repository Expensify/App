import React from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

type TwoFactorAuthFormProps = {
    /**
     * A ref to forward to the Pressable
     */
    innerRef: () => void;
     
}

function TwoFactorAuthForm({
    innerRef, 
}: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="sms-otp"
        />
    );
}

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
