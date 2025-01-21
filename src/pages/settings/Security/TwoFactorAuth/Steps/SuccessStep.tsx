import React from 'react';
import AnimatedStep from '@components/AnimatedStep';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import {openLink} from '@userActions/Link';
import {clearTwoFactorAuthData} from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

type SuccessStepParams = {
    backTo?: Route;
    forwardTo?: string;
};

function SuccessStep({backTo, forwardTo}: SuccessStepParams) {
    const {setStep} = useTwoFactorAuthContext();

    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();

    return (
        <AnimatedStep
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS}
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
            }}
        >
            <ConfirmationPage
                illustration={LottieAnimations.Fireworks}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={() => {
                    clearTwoFactorAuthData();
                    setStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED);
                    if (backTo) {
                        Navigation.navigate(backTo);
                    }
                    if (forwardTo) {
                        openLink(forwardTo, environmentURL);
                    }
                }}
            />
        </AnimatedStep>
    );
}

export default SuccessStep;
