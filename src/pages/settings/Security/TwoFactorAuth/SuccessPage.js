import React from 'react';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as LottieAnimations from '../../../../components/LottieAnimations';
import ConfirmationPage from '../../../../components/ConfirmationPage';

const defaultProps = {};

function SuccessPage(props) {
    return (
        <ScreenWrapper shouldShowOfflineIndicator={false}>
            <HeaderWithBackButton
                title={props.translate('twoFactorAuth.headerTitle')}
                stepCounter={{
                    step: 3,
                    text: props.translate('twoFactorAuth.stepSuccess'),
                }}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
            <FullPageOfflineBlockingView>
                <ConfirmationPage
                    animation={LottieAnimations.Fireworks}
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
