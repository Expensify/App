import React from 'react';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationValidateCodePage from '@components/MultifactorAuthentication/ValidateCodePage';
import {PHONE_NUMBER} from '@libs/API/MultifactorAuthenticationMock';

function MultifactorAuthenticationFactorSmsOtpPage() {
    // TODO: MFA/Dev Phone number should be retrieved from the currently logged account
    const phoneNumber = PHONE_NUMBER;
    const {update} = useMultifactorAuthenticationContext();

    return (
        <MultifactorAuthenticationValidateCodePage
            title="multifactorAuthentication.biometrics.fallbackPageTitle"
            description="multifactorAuthentication.biometrics.fallbackPageSmsOtpContent"
            contactMethod={phoneNumber}
            autoComplete="sms-otp"
            errorMessages={{
                empty: 'multifactorAuthentication.smsOtpForm.error.pleaseFillSmsOtp',
                invalid: 'multifactorAuthentication.smsOtpForm.error.incorrectSmsOtp',
            }}
            resendButtonText="validateCodeForm.magicCodeNotReceived"
            onSubmit={(code: string) => {
                update({otp: Number(code)});
            }}
            isVerifying={false}
        />
    );
}

MultifactorAuthenticationFactorSmsOtpPage.displayName = 'MultifactorAuthenticationFactorSmsOtpPage';

export default MultifactorAuthenticationFactorSmsOtpPage;
