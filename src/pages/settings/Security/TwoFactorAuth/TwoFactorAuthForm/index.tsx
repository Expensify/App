import React from 'react';
import type { RefObject } from 'react';
import BaseTwoFactorAuthForm from './BaseTwoFactorAuthForm';

type TwoFactorAuthFormProps = {
    /**
     * A ref to forward to the Pressable
     */
    innerRef: RefObject<HTMLFormElement>;
     
}

function TwoFactorAuthForm({ 
    innerRef
 }: TwoFactorAuthFormProps) {
    return (
        <BaseTwoFactorAuthForm
            ref={innerRef}
            autoComplete="one-time-code"
        />
    );
}

TwoFactorAuthForm.displayName = 'TwoFactorAuthForm';

export default TwoFactorAuthForm;
