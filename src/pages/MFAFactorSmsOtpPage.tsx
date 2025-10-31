import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';
import {useMFAFallback} from '@contexts/MFAFallbackContext';

function MFAFactorSmsOtpPage() {
    const {verifySmsOtp, isVerifying} = useMFAFallback();
    // TODO: Get phoneNumber from account/session when available
    const phoneNumber = '+48660939866';

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
            resendButtonText="smsOtpForm.smsOtpNotReceived"
            onSubmit={verifySmsOtp}
            isVerifying={isVerifying}
        />
    );
}

MFAFactorSmsOtpPage.displayName = 'MFAFactorSmsOtpPage';

export default MFAFactorSmsOtpPage;