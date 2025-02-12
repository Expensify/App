import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import LottieAnimations from '@components/LottieAnimations';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import * as Link from '@userActions/Link';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
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
        <StepWrapper
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
                    TwoFactorAuthActions.clearTwoFactorAuthData();
                    setStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED);
                    if (backTo) {
                        Navigation.navigate(backTo);
                    }
                    if (forwardTo) {
                        Link.openLink(forwardTo, environmentURL);
                    }
                }}
            />
        </StepWrapper>
    );
}

export default SuccessStep;
