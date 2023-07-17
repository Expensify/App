import React from 'react';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import FireworksAnimation from '../../../../../../assets/animations/Fireworks.json';
import ConfirmationPage from '../../../../../components/ConfirmationPage';
import * as TwoFactorAuthActions from "../../../../../libs/actions/TwoFactorAuthActions";
import StepWrapper from "../StepWrapper/StepWrapper";

function SuccessStep({translate}) {
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
                onButtonPress={TwoFactorAuthActions.quitAndNavigateBackToSettings}
            />
        </StepWrapper>
    );
}

SuccessStep.propTypes = withLocalizePropTypes;
SuccessStep.defaultProps = {};

export default withLocalize(SuccessStep);
