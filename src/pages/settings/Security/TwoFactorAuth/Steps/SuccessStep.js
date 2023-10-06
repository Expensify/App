import React from 'react';
import ConfirmationPage from '../../../../../components/ConfirmationPage';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import * as LottieAnimations from '../../../../../components/LottieAnimations';
import StepWrapper from '../StepWrapper/StepWrapper';
import useLocalize from '../../../../../hooks/useLocalize';
import Navigation from '../../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../../ROUTES';
import CONST from '../../../../../CONST';

function SuccessStep() {
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
                    Navigation.navigate(ROUTES.SETTINGS_2FA.ENABLED, CONST.NAVIGATION.TYPE.FORCED_UP);
                }}
            />
        </StepWrapper>
    );
}

export default SuccessStep;
