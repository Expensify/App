import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {SafeAreaView} from 'react-native-safe-area-context';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import SignInPageLayout from './SignInPageLayout';
import LoginForm from './LoginForm';
import PasswordForm from './PasswordForm';
import ValidateCodeForm from './ValidateCodeForm';
import ResendValidationForm from './ResendValidationForm';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Performance from '../../libs/Performance';
import * as App from '../../libs/actions/App';
import * as Localize from '../../libs/Localize';
import usePermissions from '../../hooks/usePermissions';
import useOnyx from '../../hooks/useOnyx';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const propTypes = {
    /** The credentials of the person signing in */
    credentials: PropTypes.shape({
        login: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    credentials: {},
};

const SignInPage = ({translate, formatPhoneNumber}) => {
    useEffect(Performance.measureTTI, []);
    useEffect(() => App.setLocale(Localize.getDevicePreferredLocale()), []);

    const account = useOnyx(ONYXKEYS.ACCOUNT, {});
    const credentials = useOnyx(ONYXKEYS.CREDENTIALS, {});

    const {canUsePasswordlessLogins} = usePermissions();
    const {isSmallScreenWidth} = useWindowDimensions();

    // Show the login form if
    // - A login has not been entered yet
    // - AND a validateCode has not been cached with sign in link
    const shouldShowLoginForm = !credentials.login && !credentials.validateCode;

    // Show the old password form if
    // - A login has been entered
    // - AND an account exists and is validated for this login
    // - AND a password hasn't been entered yet
    // - AND haven't forgotten password
    // - AND the user is NOT on the passwordless beta
    const shouldShowPasswordForm = credentials.login
        && account.validated
        && !credentials.password
        && !account.forgotPassword
        && !canUsePasswordlessLogins;

    // Show the new magic code / validate code form if
    // - A login has been entered or a validateCode has been cached from sign in link
    // - AND the user is on the 'passwordless' beta
    const shouldShowValidateCodeForm = (credentials.login || credentials.validateCode)
        && canUsePasswordlessLogins;

    // Show the resend validation link form if
    // - A login has been entered
    // - AND is not validated or password is forgotten
    // - AND user is not on 'passwordless' beta
    const shouldShowResendValidationForm = credentials.login
        && (!account.validated || account.forgotPassword)
        && !canUsePasswordlessLogins;

    let welcomeHeader = '';
    let welcomeText = '';
    if (shouldShowValidateCodeForm) {
        if (account.requiresTwoFactorAuth) {
            // We will only know this after a user signs in successfully, without their 2FA code
            welcomeHeader = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
            welcomeText = translate('validateCodeForm.enterAuthenticatorCode');
        } else {
            const userLogin = Str.removeSMSDomain(lodashGet(credentials, 'login', ''));

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
        welcomeText = isSmallScreenWidth
            ? `${translate('welcomeText.welcomeBack')} ${translate('welcomeText.enterPassword')}`
            : translate('welcomeText.enterPassword');
    } else if (!shouldShowResendValidationForm) {
        welcomeHeader = isSmallScreenWidth ? translate('login.hero.header') : translate('welcomeText.getStarted');
        welcomeText = isSmallScreenWidth ? translate('welcomeText.getStarted') : '';
    }

    return (
        <SafeAreaView style={[styles.signInPage]}>
            <SignInPageLayout
                welcomeHeader={welcomeHeader}
                welcomeText={welcomeText}
                shouldShowWelcomeHeader={(shouldShowLoginForm || shouldShowPasswordForm || shouldShowValidateCodeForm || !shouldShowResendValidationForm) || !isSmallScreenWidth}
                shouldShowWelcomeText={shouldShowLoginForm || shouldShowPasswordForm || shouldShowValidateCodeForm || !shouldShowResendValidationForm}
            >
                {/* LoginForm and PasswordForm must use the isVisible prop. This keeps them mounted, but visually hidden
                    so that password managers can access the values. Conditionally rendering these components will break this feature. */}
                <LoginForm isVisible={shouldShowLoginForm} blurOnSubmit={account.validated === false} />
                {shouldShowValidateCodeForm ? (
                    <ValidateCodeForm isVisible={shouldShowValidateCodeForm} />
                ) : (
                    <PasswordForm isVisible={shouldShowPasswordForm} />
                )}
                {shouldShowResendValidationForm && <ResendValidationForm />}
            </SignInPageLayout>
        </SafeAreaView>
    );
};

SignInPage.propTypes = propTypes;
SignInPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
)(SignInPage);
