import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import type {BackToAndForwardToParms} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';

function SuccessStep({backTo, forwardTo}: BackToAndForwardToParms) {
    const {setStep} = useTwoFactorAuthContext();

    const {translate} = useLocalize();

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
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
                    if (forwardTo) {
                        Navigation.navigate(forwardTo);
                        return;
                    }
                    if (backTo) {
                        Navigation.navigate(backTo);
                    }
                }}
            />
        </StepWrapper>
    );
}

export default SuccessStep;
