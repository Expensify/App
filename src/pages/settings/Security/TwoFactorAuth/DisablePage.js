import React, {Component} from 'react';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
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

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {};

class DisablePage extends Component {
    componentDidMount() {
        Session.disableTwoFactorAuth();
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('twoFactorAuth.disableTwoFactorAuth')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                <FullPageOfflineBlockingView>
                    <BlockingView
                        icon={Illustrations.LockOpen}
                        iconWidth={200}
                        iconHeight={164}
                        title={this.props.translate('twoFactorAuth.disabled')}
                        subtitle={this.props.translate('twoFactorAuth.noAuthenticatorApp')}
                    />
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            text={this.props.translate('common.buttonConfirm')}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SECURITY)}
                        />
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }
}

DisablePage.propTypes = propTypes;
DisablePage.defaultProps = defaultProps;

export default withLocalize(DisablePage);
