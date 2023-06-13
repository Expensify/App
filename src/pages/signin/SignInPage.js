import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import SignInPageLayout from './SignInPageLayout';
import LoginForm from './LoginForm';
import PasswordForm from './PasswordForm';
import ValidateCodeForm from './ValidateCodeForm';
import ResendValidationForm from './ResendValidationForm';
import Performance from '../../libs/Performance';
import * as App from '../../libs/actions/App';
import UnlinkLoginForm from './UnlinkLoginForm';
import * as Localize from '../../libs/Localize';
import useLocalize from '../../hooks/useLocalize';
import usePermissions from '../../hooks/usePermissions';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import Log from '../../libs/Log';
import * as StyleUtils from '../../styles/StyleUtils';

const propTypes = {
    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Error to display when there is an account error returned */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Whether the account is validated */
        validated: PropTypes.bool,

        /** The primaryLogin associated with the account */
        primaryLogin: PropTypes.string,

        /** Has the user pressed the forgot password button? */
        forgotPassword: PropTypes.bool,

        /** Does this account require 2FA? */
        requiresTwoFactorAuth: PropTypes.bool,
    }),

    /** The credentials of the person signing in */
    credentials: PropTypes.shape({
        login: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
        validateCode: PropTypes.string,
    }),
};

const defaultProps = {
    account: {},
    credentials: {},
};

/**
 * @param {Boolean} hasLogin
 * @param {Boolean} hasPassword
 * @param {Boolean} hasValidateCode
 * @param {Boolean} isPrimaryLogin
 * @param {Boolean} isAccountValidated
 * @param {Boolean} didForgetPassword
 * @param {Boolean} canUsePasswordlessLogins
 * @returns {Object}
 */
function getRenderOptions({hasLogin, hasPassword, hasValidateCode, isPrimaryLogin, isAccountValidated, didForgetPassword, canUsePasswordlessLogins}) {
    const shouldShowLoginForm = !hasLogin && !hasValidateCode;
    const isUnvalidatedSecondaryLogin = hasLogin && !isPrimaryLogin && !isAccountValidated;
    const shouldShowPasswordForm = hasLogin && isAccountValidated && !hasPassword && !didForgetPassword && !isUnvalidatedSecondaryLogin && !canUsePasswordlessLogins;
    const shouldShowValidateCodeForm = (hasLogin || hasValidateCode) && !isUnvalidatedSecondaryLogin && canUsePasswordlessLogins;
    const shouldShowResendValidationForm = hasLogin && (!isAccountValidated || didForgetPassword) && !isUnvalidatedSecondaryLogin && !canUsePasswordlessLogins;
    const shouldShowWelcomeHeader = shouldShowLoginForm || shouldShowPasswordForm || shouldShowValidateCodeForm || isUnvalidatedSecondaryLogin;
    const shouldShowWelcomeText = shouldShowLoginForm || shouldShowPasswordForm || shouldShowValidateCodeForm;
    return {
        shouldShowLoginForm,
        shouldShowUnlinkLoginForm: isUnvalidatedSecondaryLogin,
        shouldShowPasswordForm,
        shouldShowValidateCodeForm,
        shouldShowResendValidationForm,
        shouldShowWelcomeHeader,
        shouldShowWelcomeText,
    };
}

function SignInPage({account, credentials}) {
    const {translate, formatPhoneNumber} = useLocalize();
    const {canUsePasswordlessLogins} = usePermissions();
    const {isSmallScreenWidth} = useWindowDimensions();
    const safeAreaInsets = useSafeAreaInsets();

    useEffect(() => Performance.measureTTI(), []);
    useEffect(() => {
        App.setLocale(Localize.getDevicePreferredLocale());
    }, []);

    const {
        shouldShowLoginForm,
        shouldShowUnlinkLoginForm,
        shouldShowPasswordForm,
        shouldShowValidateCodeForm,
        shouldShowResendValidationForm,
        shouldShowWelcomeHeader,
        shouldShowWelcomeText,
    } = getRenderOptions({
        hasLogin: Boolean(credentials.login),
        hasPassword: Boolean(credentials.password),
        hasValidateCode: Boolean(credentials.validateCode),
        isPrimaryLogin: account.primaryLogin && account.primaryLogin === credentials.login,
        isAccountValidated: Boolean(account.validated),
        didForgetPassword: Boolean(account.forgotPassword),
        canUsePasswordlessLogins,
    });

    let welcomeHeader;
    let welcomeText;
    if (shouldShowValidateCodeForm) {
        if (account.requiresTwoFactorAuth) {
            // We will only know this after a user signs in successfully, without their 2FA code
            welcomeHeader = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
            welcomeText = translate('validateCodeForm.enterAuthenticatorCode');
        } else {
            const userLogin = Str.removeSMSDomain(credentials.login || '');

            // replacing spaces with "hard spaces" to prevent breaking the number
            const userLoginToDisplay = Str.isSMSLogin(userLogin) ? formatPhoneNumber(userLogin).replace(/ /g, '\u00A0') : userLogin;
            if (account.validated) {
                welcomeHeader = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
                welcomeText = isSmallScreenWidth
                    ? `${translate('welcomeText.welcomeBack')} ${translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay})}`
                    : translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay});
            } else {
                welcomeHeader = isSmallScreenWidth ? '' : translate('welcomeText.welcome');
                welcomeText = isSmallScreenWidth
                    ? `${translate('welcomeText.welcome')} ${translate('welcomeText.newFaceEnterMagicCode', {login: userLoginToDisplay})}`
                    : translate('welcomeText.newFaceEnterMagicCode', {login: userLoginToDisplay});
            }
        }
    } else if (shouldShowPasswordForm) {
        welcomeHeader = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
        welcomeText = isSmallScreenWidth ? `${translate('welcomeText.welcomeBack')} ${translate('welcomeText.enterPassword')}` : translate('welcomeText.enterPassword');
    } else if (shouldShowUnlinkLoginForm) {
        welcomeHeader = isSmallScreenWidth ? translate('login.hero.header') : translate('welcomeText.welcomeBack');
    } else if (!shouldShowResendValidationForm) {
        welcomeHeader = isSmallScreenWidth ? translate('login.hero.header') : translate('welcomeText.getStarted');
        welcomeText = isSmallScreenWidth ? translate('welcomeText.getStarted') : '';
    } else {
        Log.warn('SignInPage in unexpected state!');
    }

    return (
        <View style={[styles.signInPage, StyleUtils.getSafeAreaPadding(safeAreaInsets, 1)]}>
            <SignInPageLayout
                welcomeHeader={welcomeHeader}
                welcomeText={welcomeText}
                shouldShowWelcomeHeader={shouldShowWelcomeHeader || !isSmallScreenWidth}
                shouldShowWelcomeText={shouldShowWelcomeText}
            >
                {/* LoginForm and PasswordForm must use the isVisible prop. This keeps them mounted, but visually hidden
                    so that password managers can access the values. Conditionally rendering these components will break this feature. */}
                <LoginForm
                    isVisible={shouldShowLoginForm}
                    blurOnSubmit={account.validated === false}
                />
                {shouldShowValidateCodeForm ? <ValidateCodeForm isVisible={shouldShowValidateCodeForm} /> : <PasswordForm isVisible={shouldShowPasswordForm} />}
                {shouldShowResendValidationForm && <ResendValidationForm />}
                {shouldShowUnlinkLoginForm && <UnlinkLoginForm />}
            </SignInPageLayout>
        </View>
    );
}

SignInPage.propTypes = propTypes;
SignInPage.defaultProps = defaultProps;
SignInPage.displayName = 'SignInPage';

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SignInPage);
