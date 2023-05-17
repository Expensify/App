import React from 'react';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import FireworksAnimation from '../../../../../assets/animations/Fireworks.json';
import ConfirmationPage from '../../../../components/ConfirmationPage';

const defaultProps = {};

function SuccessPage(props) {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('twoFactorAuth.headerTitle')}
                shouldShowStepCounter
                stepCounter={{
                    step: 3,
                    text: props.translate('twoFactorAuth.stepSuccess'),
                }}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <FullPageOfflineBlockingView>
                <ConfirmationPage
                    animation={FireworksAnimation}
                    heading={props.translate('twoFactorAuth.enabled')}
                    description={props.translate('twoFactorAuth.congrats')}
                    shouldShowButton
                    buttonText={props.translate('common.buttonConfirm')}
                    onButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_2FA_IS_ENABLED)}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

SuccessPage.propTypes = withLocalizePropTypes;
SuccessPage.defaultProps = defaultProps;

export default withLocalize(SuccessPage);
