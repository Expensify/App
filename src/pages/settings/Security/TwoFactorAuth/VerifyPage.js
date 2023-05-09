import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import QRCode from 'react-qr-code';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import ROUTES from '../../../../ROUTES';
import FullPageOfflineBlockingView from '../../../../components/BlockingViews/FullPageOfflineBlockingView';
import styles from '../../../../styles/styles';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextLink from '../../../../components/TextLink';
import Clipboard from '../../../../libs/Clipboard';
import themeColors from '../../../../styles/themes/default';
import FixedFooter from '../../../../components/FixedFooter';
import TwoFactorAuthForm from './TwoFactorAuthForm';

const propTypes = {
    account: PropTypes.shape({
        /** Whether this account has 2-FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Secret key to enable 2-FA within the authenticator app */
        twoFactorAuthSecretKey: PropTypes.string,

        /** User primary login to attach to the authenticator QRCode */
        primaryLogin: PropTypes.string,

        /** User is submitting the authentication code */
        isLoading: PropTypes.bool,

        /** Server-side errors in the submitted authentication code */
        errors: PropTypes.objectOf(PropTypes.string),
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
        twoFactorAuthSecretKey: '',
        primaryLogin: '',
        isLoading: false,
        errors: {},
    },
};

class VerifyPage extends Component {
    constructor(props) {
        super(props);

        this.copySecret = this.copySecret.bind(this);
        this.splitSecretInChunks = this.splitSecretInChunks.bind(this);
        this.buildAuthenticatorUrl = this.buildAuthenticatorUrl.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (!this.props.account.requiresTwoFactorAuth) {
            return;
        }

        if (!prevProps.account.requiresTwoFactorAuth && this.props.account.requiresTwoFactorAuth) {
            Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_SUCCESS);
        }
    }

    copySecret() {
        Clipboard.setString(this.props.account.twoFactorAuthSecretKey);
    }

    /**
     * Splits the two-factor auth secret key in 4 chunks
     *
     * @param {String} secret
     * @returns {*|string}
     */
    splitSecretInChunks(secret) {
        if (secret.length !== 16) {
            return secret;
        }

        return `${secret.slice(0, 4)} ${secret.slice(4, 8)} ${secret.slice(8, 12)} ${secret.slice(12, secret.length)}`;
    }

    /**
     * Builds the URL string to generate the QRCode, using the otpauth:// protocol,
     * so it can be detected by authenticator apps
     *
     * @returns {string}
     */
    buildAuthenticatorUrl() {
        return `otpauth://totp/Expensify:${this.props.account.primaryLogin}?secret=${this.props.account.twoFactorAuthSecretKey}&issuer=Expensify`;
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('twoFactorAuth.headerTitle')}
                    subtitle={this.props.translate('twoFactorAuth.stepVerify')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_TWO_FACTOR_CODES)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                <FullPageOfflineBlockingView>
                    <ScrollView style={[styles.mb5]}>
                        <View style={[styles.ph5, styles.mt3]}>
                            <Text>
                                {this.props.translate('twoFactorAuth.scanCode')}
                                <TextLink href="https://community.expensify.com/discussion/7736/faq-troubleshooting-two-factor-authentication-issues/p1?new=1">
                                    {' '}
                                    {this.props.translate('twoFactorAuth.authenticatorApp')}
                                </TextLink>
                                .
                            </Text>

                            <View style={[styles.alignItemsCenter, styles.mt5]}>
                                <QRCode
                                    level="L"
                                    size={128}
                                    value={this.buildAuthenticatorUrl()}
                                    bgColor={themeColors.appBG}
                                    fgColor={themeColors.textSupporting}
                                />
                            </View>

                            <Text style={[styles.mt5]}>
                                {this.props.translate('twoFactorAuth.addKey')}
                            </Text>

                            <View style={[styles.mt11, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                {Boolean(this.props.account.twoFactorAuthSecretKey) && (
                                    <Text>
                                        {this.splitSecretInChunks(this.props.account.twoFactorAuthSecretKey)}
                                    </Text>
                                )}
                                <Button medium onPress={this.copySecret}>
                                    <Text>
                                        Copy
                                    </Text>
                                </Button>
                            </View>

                            <Text style={[styles.mt11]}>
                                {this.props.translate('twoFactorAuth.enterCode')}
                            </Text>
                        </View>

                        <View style={[styles.mt3, styles.mh5]}>
                            <TwoFactorAuthForm />
                        </View>
                    </ScrollView>

                    <FixedFooter style={[styles.twoFactorAuthFooter]}>
                        <Button
                            success
                            text={this.props.translate('common.next')}
                            isDisabled
                            isLoading={this.props.account.isLoading}
                        />
                    </FixedFooter>
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }
}

VerifyPage.propTypes = propTypes;
VerifyPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(VerifyPage);
