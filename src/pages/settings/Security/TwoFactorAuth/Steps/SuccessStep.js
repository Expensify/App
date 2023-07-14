import React from 'react';
import Navigation from '../../../../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import ROUTES from '../../../../../ROUTES';
import FireworksAnimation from '../../../../../../assets/animations/Fireworks.json';
import ConfirmationPage from '../../../../../components/ConfirmationPage';
import StepWrapper from "../StepWrapper/StepWrapper";

const defaultProps = {};

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
                onButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
        </StepWrapper>
    );
}

SuccessStep.propTypes = withLocalizePropTypes;
SuccessStep.defaultProps = defaultProps;

export default withLocalize(SuccessStep);
