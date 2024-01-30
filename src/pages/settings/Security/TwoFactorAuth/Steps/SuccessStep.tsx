import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import type { Route } from '@src/ROUTES';

type SuccessStepProps = {
    /** The route where user needs to be redirected after setting up 2FA */
    backTo: string;
};

function SuccessStep({
    backTo=''
}:SuccessStepProps) {
    const {setStep} = useTwoFactorAuthContext();

    const {translate} = useLocalize();

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
                total: 3,
            }}
        >
            <ConfirmationPage
                animation={LottieAnimations.Fireworks}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={() => {
                    TwoFactorAuthActions.clearTwoFactorAuthData();
                    setStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED);
                    if (backTo) {
                        Navigation.navigate(backTo as Route);
                    }
                }}
            />
        </StepWrapper>
    );
}

export default SuccessStep;
