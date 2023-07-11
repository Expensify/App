import React, {useEffect} from 'react';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import styles from '../../../../styles/styles';
import BlockingView from '../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';
import * as Session from '../../../../libs/actions/Session';
import variables from '../../../../styles/variables';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {};

function DisablePage(props) {
    useEffect(() => {
        Session.toggleTwoFactorAuth(false);
    }, []);

    return (
        <ScreenWrapper shouldShowOfflineIndicator={false}>
            <HeaderWithBackButton
                title={props.translate('twoFactorAuth.disableTwoFactorAuth')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />

            <FullPageOfflineBlockingView>
                <BlockingView
                    icon={Illustrations.LockOpen}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={props.translate('twoFactorAuth.disabled')}
                    subtitle={props.translate('twoFactorAuth.noAuthenticatorApp')}
                />
                <FixedFooter style={[styles.flexGrow0]}>
                    <Button
                        success
                        text={props.translate('common.buttonConfirm')}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

DisablePage.propTypes = propTypes;
DisablePage.defaultProps = defaultProps;

export default withLocalize(DisablePage);
