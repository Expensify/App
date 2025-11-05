import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';

function MFAFactorSmsOtpPage() {
    // TODO: Get phoneNumber from account/session when available i dont really know where from - waiting for response on slack
    const phoneNumber = '+48660939866';
    const {update} = useMultifactorAuthenticationContext();

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
                update({otp: Number(code)});
            }}
            isVerifying={false}
        />
    );
}

MFAFactorSmsOtpPage.displayName = 'MFAFactorSmsOtpPage';

export default MFAFactorSmsOtpPage;
