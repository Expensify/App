import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
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
import FixedFooter from '../../../../components/FixedFooter';
import TwoFactorAuthForm from './TwoFactorAuthForm';
import QRCode from '../../../../components/QRCode';
import expensifyLogo from '../../../../../assets/images/expensify-logo-round-dark.png';

const propTypes = {
    ...withLocalizePropTypes,
    account: PropTypes.shape({
        /** Whether this account has 2FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Secret key to enable 2FA within the authenticator app */
        twoFactorAuthSecretKey: PropTypes.string,

        /** User primary login to attach to the authenticator QRCode */
        primaryLogin: PropTypes.string,

        /** User is submitting the authentication code */
        isLoading: PropTypes.bool,

        /** Server-side errors in the submitted authentication code */
        errors: PropTypes.objectOf(PropTypes.string),
    }),
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

function VerifyPage(props) {
    useEffect(() => {
        if (!props.account.requiresTwoFactorAuth) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA_SUCCESS);
    }, [props.account.requiresTwoFactorAuth]);

    /**
     * Splits the two-factor auth secret key in 4 chunks
     *
     * @param {String} secret
     * @returns {string}
     */
    function splitSecretInChunks(secret) {
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
    function buildAuthenticatorUrl() {
        return `otpauth://totp/Expensify:${props.account.primaryLogin}?secret=${props.account.twoFactorAuthSecretKey}&issuer=Expensify`;
    }

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('twoFactorAuth.headerTitle')}
                shouldShowStepCounter
                stepCounter={{
                    step: 2,
                    text: props.translate('twoFactorAuth.stepVerify'),
                }}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_2FA_CODES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <FullPageOfflineBlockingView>
                <ScrollView style={styles.mb5}>
                    <View style={[styles.ph5, styles.mt3]}>
                        <Text>
                            {props.translate('twoFactorAuth.scanCode')}
                            <TextLink href="https://community.expensify.com/discussion/7736/faq-troubleshooting-two-factor-authentication-issues/p1?new=1">
                                {' '}
                                {props.translate('twoFactorAuth.authenticatorApp')}
                            </TextLink>
                            .
                        </Text>
                        <View style={[styles.alignItemsCenter, styles.mt5]}>
                            <QRCode
                                url={buildAuthenticatorUrl()}
                                logo={expensifyLogo}
                            />
                        </View>
                        <Text style={styles.mt5}>{props.translate('twoFactorAuth.addKey')}</Text>
                        <View style={[styles.mt11, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            {Boolean(props.account.twoFactorAuthSecretKey) && <Text>{splitSecretInChunks(props.account.twoFactorAuthSecretKey)}</Text>}
                            <Button
                                text={props.translate('twoFactorAuth.copy')}
                                onPress={() => Clipboard.setString(props.account.twoFactorAuthSecretKey)}
                                medium
                            />
                        </View>
                        <Text style={styles.mt11}>{props.translate('twoFactorAuth.enterCode')}</Text>
                    </View>
                    <View style={[styles.mt3, styles.mh5]}>
                        <TwoFactorAuthForm />
                    </View>
                </ScrollView>
                <FixedFooter style={[styles.twoFactorAuthFooter]}>
                    <Button
                        success
                        text={props.translate('common.next')}
                        isDisabled
                        isLoading={props.account.isLoading}
                    />
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

VerifyPage.propTypes = propTypes;
VerifyPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(VerifyPage);
