import React from 'react';
import MFAValidateCodePage from '@components/MultiFactorAuthentication/MFAValidateCodePage';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function MFAFactorMagicCodePage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const email = account?.primaryLogin ?? '';
    const {update} = useMultifactorAuthenticationContext();

    return (
        <MFAValidateCodePage
            title="multiFactorAuthentication.biometrics.fallbackPageTitle"
            description="multiFactorAuthentication.biometrics.fallbackPageMagicCodeContent"
            contactMethod={email}
            autoComplete="one-time-code"
            errorMessages={{
                empty: 'validateCodeForm.error.pleaseFillMagicCode',
                invalid: 'validateCodeForm.error.incorrectMagicCode',
            }}
            resendButtonText="validateCodeForm.magicCodeNotReceived"
            onSubmit={(code: string) => {
                // call async verify but keep onSubmit signature void
                update({validateCode: Number(code)});
            }}
            isVerifying={false}
        />
    );
}

MFAFactorMagicCodePage.displayName = 'MFAFactorMagicCodePage';

export default MFAFactorMagicCodePage;
