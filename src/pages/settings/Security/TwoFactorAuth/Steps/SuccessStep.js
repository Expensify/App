import React from 'react';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import FireworksAnimation from '../../../../../../assets/animations/Fireworks.json';
import ConfirmationPage from '../../../../../components/ConfirmationPage';
import * as TwoFactorAuthActions from "../../../../../libs/actions/TwoFactorAuthActions";
import CONST from "../../../../../CONST";
import StepWrapper from "../StepWrapper/StepWrapper";
import useTwoFactorAuthContext from "../TwoFactorAuthContext/useTwoFactorAuth";

function SuccessStep({translate}) {
    const {setStep} = useTwoFactorAuthContext();

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 3,
                text: translate('twoFactorAuth.stepSuccess'),
            }}
        >
            <ConfirmationPage
                animation={FireworksAnimation}
                heading={translate('twoFactorAuth.enabled')}
                description={translate('twoFactorAuth.congrats')}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={() => {
                    TwoFactorAuthActions.clearTwoFactorAuthData();
                    setStep(CONST.TWO_FACTOR_AUTH_STEPS.IS_ENABLED);
                }}
            />
        </StepWrapper>
    );
}

SuccessStep.propTypes = withLocalizePropTypes;

export default withLocalize(SuccessStep);
