import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';

function MFAFactorSmsOtpPage() {
    // TODO: Get phoneNumber from account/session when available i dont really know where from
    const phoneNumber = '+48660939866';

    /**
     * Fake verify function for magic code / authenticator / sms flows.
     * Does nothing (no-op) and resolves immediately.
     */
    function verifySmsOtp(code?: string) {
        // Intentionally no-op. Keep a log to help debugging.
        // eslint-disable-next-line no-console
        console.log('[fakeMFA] verifyMagicCode called with:', code);
    }

    return (
        <MFAValidateCodePage
            title="multiFactorAuthentication.biometrics.fallbackPageTitle"
            description="multiFactorAuthentication.biometrics.fallbackPageSMSotpContent"
            contactMethod={phoneNumber}
            autoComplete="sms-otp"
            errorMessages={{
                empty: 'smsOtpForm.error.pleaseFillSmsOtp',
                invalid: 'smsOtpForm.error.incorrectSmsOtp',
            }}
            resendButtonText="validateCodeForm.magicCodeNotReceived"
            onSubmit={(code: string) => {
                // call async verify but keep onSubmit signature void
                verifySmsOtp(code);
            }}
            isVerifying={false}
        />
    );
}

MFAFactorSmsOtpPage.displayName = 'MFAFactorSmsOtpPage';

export default MFAFactorSmsOtpPage;
