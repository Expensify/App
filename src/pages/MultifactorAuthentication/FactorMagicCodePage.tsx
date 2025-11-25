import React from 'react';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationValidateCodePage from '@components/MultifactorAuthentication/ValidateCodePage';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function MultifactorAuthenticationFactorMagicCodePage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const email = account?.primaryLogin ?? '';
    const {update} = useMultifactorAuthenticationContext();

    return (
        <MultifactorAuthenticationValidateCodePage
            title="multifactorAuthentication.biometrics.fallbackPageTitle"
            description="multifactorAuthentication.biometrics.fallbackPageMagicCodeContent"
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

MultifactorAuthenticationFactorMagicCodePage.displayName = 'MultifactorAuthenticationFactorMagicCodePage';

export default MultifactorAuthenticationFactorMagicCodePage;
