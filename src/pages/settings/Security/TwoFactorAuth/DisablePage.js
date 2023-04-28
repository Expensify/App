import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as Illustrations from '../../../../components/Icon/Illustrations';
import styles from '../../../../styles/styles';
import BlockingView from '../../../../components/BlockingViews/BlockingView';
import FixedFooter from '../../../../components/FixedFooter';
import Button from '../../../../components/Button';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
};

class DisablePage extends Component {
    componentDidMount() {
        // TODO: TO BE IMPLEMENTED
        // Session.toggleTwoFactorAuth(false);
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

export default compose(
    withLocalize,
    withOnyx({
    }),
)(DisablePage);
