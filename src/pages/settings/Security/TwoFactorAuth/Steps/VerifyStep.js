import {CommonActions, useNavigation} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import QRCode from '@components/QRCode';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import TwoFactorAuthForm from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm';
import {defaultAccount, TwoFactorAuthPropTypes} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthPropTypes';
import styles from '@styles/styles';
import * as Session from '@userActions/Session';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const TROUBLESHOOTING_LINK = 'https://community.expensify.com/discussion/7736/faq-troubleshooting-two-factor-authentication-issues/p1?new=1';

const defaultProps = {
    account: defaultAccount,
    session: {
        email: null,
    },
};

function VerifyStep({account, session}) {
    const {translate} = useLocalize();
    const navigation = useNavigation();
    const {inputCallbackRef, inputRef} = useAutoFocusInput();

    useEffect(() => {
        Session.clearAccountMessages();

        if (account.requiresTwoFactorAuth) {
            Navigation.navigate(ROUTES.SETTINGS_2FA.ENABLED, CONST.NAVIGATION.TYPE.FORCED_UP);
            return;
        }

        if (!account.codesAreCopied) {
            Navigation.navigate(ROUTES.SETTINGS_2FA.CODES, CONST.NAVIGATION.TYPE.FORCED_UP);
            return;
        }

        return () => {
            Session.clearAccountMessages();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!account.requiresTwoFactorAuth) {
            return;
        }

        TwoFactorAuthActions.setTwoFactorAuthStep('SUCCESS');

        navigation.dispatch({
            ...CommonActions.goBack(),
            source: navigation.getState().key,
        });

        Navigation.navigate(ROUTES.SETTINGS_2FA.SUCCESS, CONST.NAVIGATION.TYPE.FORCED_UP);
    }, [account.requiresTwoFactorAuth, navigation]);

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
        return `otpauth://totp/Expensify:${account.primaryLogin || session.email}?secret=${account.twoFactorAuthSecretKey}&issuer=Expensify`;
    }

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 2,
                text: translate('twoFactorAuth.stepVerify'),
                total: 3,
            }}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_2FA.CODES)}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            >
                <View style={[styles.ph5, styles.mt3]}>
                    <Text>
                        {translate('twoFactorAuth.scanCode')}
                        <TextLink href={TROUBLESHOOTING_LINK}> {translate('twoFactorAuth.authenticatorApp')}</TextLink>.
                    </Text>
                    <View style={[styles.alignItemsCenter, styles.mt5]}>
                        <QRCode
                            url={buildAuthenticatorUrl()}
                            logo={expensifyLogo}
                            logoRatio={CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO}
                            logoMarginRatio={CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO}
                        />
                    </View>
                    <Text style={styles.mt5}>{translate('twoFactorAuth.addKey')}</Text>
                    <View style={[styles.mt11, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        {Boolean(account.twoFactorAuthSecretKey) && <Text>{splitSecretInChunks(account.twoFactorAuthSecretKey)}</Text>}
                        <PressableWithDelayToggle
                            text={translate('twoFactorAuth.copy')}
                            textChecked={translate('common.copied')}
                            icon={Expensicons.Copy}
                            inline={false}
                            onPress={() => Clipboard.setString(account.twoFactorAuthSecretKey)}
                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCopyCodeButton]}
                            textStyles={[styles.buttonMediumText]}
                        />
                    </View>
                    <Text style={styles.mt11}>{translate('twoFactorAuth.enterCode')}</Text>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <View style={[styles.mh5, styles.mb4]}>
                    <TwoFactorAuthForm innerRef={inputCallbackRef} />
                </View>
                <Button
                    success
                    text={translate('common.next')}
                    isLoading={account.isLoading}
                    onPress={() => {
                        if (!inputRef.current) {
                            return;
                        }
                        inputRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

VerifyStep.propTypes = {
    /** Information about the users account that is logging in */
    account: TwoFactorAuthPropTypes.account,

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Email address */
        email: PropTypes.string.isRequired,
    }),
};
VerifyStep.defaultProps = defaultProps;

// eslint-disable-next-line rulesdir/onyx-props-must-have-default
export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    session: {key: ONYXKEYS.SESSION},
})(VerifyStep);
