import React from 'react';
import MFAValidateCodePage from '@components/MFA/MFAValidateCodePage';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {PHONE_NUMBER} from '../../__mocks__/ecuk_api/utils';

function MFAFactorSmsOtpPage() {
    // TODO: numer telefonu z sesji
    const phoneNumber = PHONE_NUMBER;
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
