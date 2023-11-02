import React from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import * as LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import Navigation from "@navigation/Navigation";
import PropTypes from "prop-types";

const propTypes = {
    backTo: PropTypes.string,
}

const defaultProps = {
    backTo: '',
}

function SuccessStep({backTo}) {
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
                    if (backTo) {
                        Navigation.navigate(backTo);
                    }
                }}
            />
        </StepWrapper>
    );
}

SuccessStep.propTypes = propTypes;
SuccessStep.defaultProps = defaultProps;

export default SuccessStep;
