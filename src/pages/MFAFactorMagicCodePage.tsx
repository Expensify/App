import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function MFAFactorMagicCodePage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const email = account?.primaryLogin ?? '';

    /**
     * Fake verify function for magic code / authenticator / sms flows.
     * Does nothing (no-op) and resolves immediately.
     */
    function verifyMagicCode(code?: string) {
        // Intentionally no-op. Keep a log to help debugging.
        // eslint-disable-next-line no-console
        console.log('[fakeMFA] verifyMagicCode called with:', code);
    }

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
                verifyMagicCode(code);
            }}
            isVerifying={false}
        />
    );
}

MFAFactorMagicCodePage.displayName = 'MFAFactorMagicCodePage';

export default MFAFactorMagicCodePage;
