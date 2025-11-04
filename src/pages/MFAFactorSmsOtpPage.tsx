import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';

function MFAFactorSmsOtpPage() {
    // TODO: Get phoneNumber from account/session when available i dont really know where from - waiting for response on slack
    const phoneNumber = '+48660939866';

    /**
     * Fake verify function for sms - it will be replaced by some update to context
     */
    function verifySmsOtp(code?: string) {
        // eslint-disable-next-line no-console
        console.log('[fakeMFA] verifyMagicCode called with:', code);
    }

    return (
        <MFAValidateCodePage
            title="multiFactorAuthentication.biometrics.fallbackPageTitle"
            description="multiFactorAuthentication.biometrics.fallbackPageSmsOtpContent"
            contactMethod={phoneNumber}
            autoComplete="sms-otp"
            errorMessages={{
                empty: 'smsOtpForm.error.pleaseFillSmsOtp',
                invalid: 'smsOtpForm.error.incorrectSmsOtp',
            }}
            resendButtonText="validateCodeForm.magicCodeNotReceived"
            onSubmit={(code: string) => {
                verifySmsOtp(code);
            }}
            isVerifying={false}
        />
    );
}

MFAFactorSmsOtpPage.displayName = 'MFAFactorSmsOtpPage';

export default MFAFactorSmsOtpPage;
