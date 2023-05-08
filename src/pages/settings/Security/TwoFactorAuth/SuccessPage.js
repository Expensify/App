import React from 'react';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import FireworksAnimation from '../../../../../assets/animations/Fireworks.json';
import styles from '../../../../styles/styles';
import BlockingView from '../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';
import ConfirmationPage from '../../../../components/ConfirmationPage';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {};

function SuccessPage(props) {
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('twoFactorAuth.headerTitle')}
                subtitle={props.translate('twoFactorAuth.stepSuccess')}
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
                    onButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_IS_ENABLED)}
                />

                {/* TODO: Depends on design team response - one of these will be removed */}
                {/* <BlockingView */}
                {/*     icon={Illustrations.Fireworks} */}
                {/*     iconWidth={200} */}
                {/*     iconHeight={164} */}
                {/*     title={props.translate('twoFactorAuth.enabled')} */}
                {/*     subtitle={props.translate('twoFactorAuth.congrats')} */}
                {/* /> */}
                {/* <FixedFooter style={[styles.flexGrow0]}> */}
                {/*     <Button */}
                {/*         success */}
                {/*         text={props.translate('common.buttonConfirm')} */}
                {/*         onPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_IS_ENABLED)} */}
                {/*     /> */}
                {/* </FixedFooter> */}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

SuccessPage.propTypes = propTypes;
SuccessPage.defaultProps = defaultProps;

export default withLocalize(SuccessPage);
