import React, {useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {SafeAreaView} from 'react-native-safe-area-context';
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

const SignInPage = ({account, credentials}) => {
    const {translate, formatPhoneNumber} = useLocalize();
    const {canUsePasswordlessLogins} = usePermissions();
    const {isSmallScreenWidth} = useWindowDimensions();

    useEffect(() => Performance.measureTTI(), []);
    useEffect(() => {
        App.setLocale(Localize.getDevicePreferredLocale());
    }, []);

    /*
     * Show the login form if:
     *   - A login has not been entered yet
     *   - AND a validateCode has not been cached with the sign in link
     */
    const shouldShowLoginForm = !credentials.login && !credentials.validateCode;

    /*
     * Show the unlink form if:
     *   - A login has been entered
     *   - AND the login is not the primary login for the account
     *   - AND the login is not validated
     */
    const isUnvalidatedSecondaryLogin = account.primaryLogin && account.primaryLogin !== credentials.login && !account.validated;
    const shouldShowUnlinkLoginForm = Boolean(credentials.login) && isUnvalidatedSecondaryLogin;

    /* Show the old password form if
     *   - A login has been entered
     *   - AND an account exists and is validated for this login
     *   - AND a password hasn't been entered yet
     *   - AND haven't forgotten password
     *   - AND the login isn't an unvalidated secondary login
     *   - AND the user is NOT on the passwordless beta
     */
    const shouldShowPasswordForm =
        Boolean(credentials.login) && account.validated && !credentials.password && !account.forgotPassword && !shouldShowUnlinkLoginForm && !canUsePasswordlessLogins;

    /* Show the new magic code / validate code form if
     *   - A login has been entered or a validateCode has been cached from sign in link
     *   - AND the login isn't an unvalidated secondary login
     *   - AND the user is on the 'passwordless' beta
     */
    const shouldShowValidateCodeForm = (credentials.login || credentials.validateCode) && !shouldShowUnlinkLoginForm && canUsePasswordlessLogins;

    /* Show the resend validation link form if
     *  - A login has been entered
     *  - AND is not validated or password is forgotten
     *  - AND the login isn't an unvalidated secondary login
     *  - AND user is not on 'passwordless' beta
     */
    const shouldShowResendValidationForm = Boolean(credentials.login) && (!account.validated || account.forgotPassword) && !shouldShowUnlinkLoginForm && !canUsePasswordlessLogins;

    const {welcomeHeader, welcomeText} = useMemo(() => {
        let header = '';
        let text = '';
        if (shouldShowValidateCodeForm) {
            if (account.requiresTwoFactorAuth) {
                // We will only know this after a user signs in successfully, without their 2FA code
                header = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
                text = translate('validateCodeForm.enterAuthenticatorCode');
            } else {
                const userLogin = Str.removeSMSDomain(credentials.login || '');

                // replacing spaces with "hard spaces" to prevent breaking the number
                const userLoginToDisplay = Str.isSMSLogin(userLogin) ? formatPhoneNumber(userLogin).replace(/ /g, '\u00A0') : userLogin;
                if (account.validated) {
                    header = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
                    text = isSmallScreenWidth
                        ? `${translate('welcomeText.welcomeBack')} ${translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay})}`
                        : translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay});
                } else {
                    header = isSmallScreenWidth ? '' : translate('welcomeText.welcome');
                    text = isSmallScreenWidth
                        ? `${translate('welcomeText.welcome')} ${translate('welcomeText.newFaceEnterMagicCode', {login: userLoginToDisplay})}`
                        : translate('welcomeText.newFaceEnterMagicCode', {login: userLoginToDisplay});
                }
            }
        } else if (shouldShowPasswordForm) {
            header = isSmallScreenWidth ? '' : translate('welcomeText.welcomeBack');
            text = isSmallScreenWidth ? `${translate('welcomeText.welcomeBack')} ${translate('welcomeText.enterPassword')}` : translate('welcomeText.enterPassword');
        } else if (shouldShowUnlinkLoginForm) {
            header = isSmallScreenWidth ? translate('login.hero.header') : translate('welcomeText.welcomeBack');
        } else if (!shouldShowResendValidationForm) {
            header = isSmallScreenWidth ? translate('login.hero.header') : translate('welcomeText.getStarted');
            text = isSmallScreenWidth ? translate('welcomeText.getStarted') : '';
        } else {
            Log.warn('SignInPage in unexpected state!');
        }
        return {welcomeHeader: header, welcomeText: text};
    }, [
        shouldShowValidateCodeForm,
        shouldShowPasswordForm,
        shouldShowUnlinkLoginForm,
        shouldShowResendValidationForm,
        account.requiresTwoFactorAuth,
        account.validated,
        credentials.login,
        isSmallScreenWidth,
        translate,
        formatPhoneNumber,
    ]);

    return (
        <SafeAreaView style={[styles.signInPage]}>
            <SignInPageLayout
                welcomeHeader={welcomeHeader}
                welcomeText={welcomeText}
                shouldShowWelcomeHeader={shouldShowLoginForm || shouldShowPasswordForm || shouldShowValidateCodeForm || shouldShowUnlinkLoginForm || !isSmallScreenWidth}
                shouldShowWelcomeText={shouldShowLoginForm || shouldShowPasswordForm || shouldShowValidateCodeForm}
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
        </SafeAreaView>
    );
};

SignInPage.propTypes = propTypes;
SignInPage.defaultProps = defaultProps;
SignInPage.displayName = 'SignInPage';

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SignInPage);
