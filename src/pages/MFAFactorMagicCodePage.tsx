import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';
import {useMFAFallback} from '@contexts/MFAFallbackContext';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function MFAFactorMagicCodePage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const {verifyMagicCode, isVerifying} = useMFAFallback();
    const email = account?.primaryLogin ?? '';

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
            onSubmit={verifyMagicCode}
            isVerifying={isVerifying}
        />
    );
}

MFAFactorMagicCodePage.displayName = 'MFAFactorMagicCodePage';

export default MFAFactorMagicCodePage;