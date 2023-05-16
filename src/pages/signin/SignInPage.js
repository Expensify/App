import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
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
import Permissions from '../../libs/Permissions';
import UnlinkLoginForm from './UnlinkLoginForm';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as Localize from '../../libs/Localize';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Error to display when there is an account error returned */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Whether the account is validated */
        validated: PropTypes.bool,

        /** The primaryLogin associated with the account */
        primaryLogin: PropTypes.string,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The credentials of the person signing in */
    credentials: PropTypes.shape({
        login: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    account: {},
    betas: [],
    credentials: {},
};

class SignInPage extends Component {
    componentDidMount() {
        Performance.measureTTI();

        App.setLocale(Localize.getDevicePreferredLocale());
    }

    render() {
        // Show the login form if
        // - A login has not been entered yet
        // - AND a validateCode has not been cached with sign in link
        const showLoginForm = !this.props.credentials.login && !this.props.credentials.validateCode;

        // Show the unlink form if
        // - A login has been entered
        // - AND the login is not the primary login
        // - AND the login is not validated
        const showUnlinkLoginForm =
            this.props.credentials.login && this.props.account.primaryLogin && this.props.account.primaryLogin !== this.props.credentials.login && !this.props.account.validated;

        // Show the old password form if
        // - A login has been entered
        // - AND an account exists and is validated for this login
        // - AND a password hasn't been entered yet
        // - AND haven't forgotten password
        // - AND the login isn't an unvalidated secondary login
        // - AND the user is NOT on the passwordless beta
        const showPasswordForm =
            Boolean(this.props.credentials.login) &&
            this.props.account.validated &&
            !this.props.credentials.password &&
            !this.props.account.forgotPassword &&
            !showUnlinkLoginForm &&
            !Permissions.canUsePasswordlessLogins(this.props.betas);

        // Show the new magic code / validate code form if
        // - A login has been entered or a validateCode has been cached from sign in link
        // - AND the login isn't an unvalidated secondary login
        // - AND the user is on the 'passwordless' beta
        const showValidateCodeForm = (this.props.credentials.login || this.props.credentials.validateCode) && !showUnlinkLoginForm && Permissions.canUsePasswordlessLogins(this.props.betas);

        // Show the resend validation link form if
        // - A login has been entered
        // - AND is not validated or password is forgotten
        // - AND the login isn't an unvalidated secondary login
        // - AND user is not on 'passwordless' beta
        const showResendValidationForm =
            Boolean(this.props.credentials.login) &&
            (!this.props.account.validated || this.props.account.forgotPassword) &&
            !showUnlinkLoginForm &&
            !Permissions.canUsePasswordlessLogins(this.props.betas);

        let welcomeHeader = '';
        let welcomeText = '';
        if (showValidateCodeForm) {
            if (this.props.account.requiresTwoFactorAuth) {
                // We will only know this after a user signs in successfully, without their 2FA code
                welcomeHeader = this.props.isSmallScreenWidth ? '' : this.props.translate('welcomeText.welcomeBack');
                welcomeText = this.props.translate('validateCodeForm.enterAuthenticatorCode');
            } else {
                const userLogin = Str.removeSMSDomain(lodashGet(this.props, 'credentials.login', ''));

                // replacing spaces with "hard spaces" to prevent breaking the number
                const userLoginToDisplay = Str.isSMSLogin(userLogin) ? this.props.formatPhoneNumber(userLogin).replace(/ /g, '\u00A0') : userLogin;
                if (this.props.account.validated) {
                    welcomeHeader = this.props.isSmallScreenWidth ? '' : this.props.translate('welcomeText.welcomeBack');
                    welcomeText = this.props.isSmallScreenWidth
                        ? `${this.props.translate('welcomeText.welcomeBack')} ${this.props.translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay})}`
                        : this.props.translate('welcomeText.welcomeEnterMagicCode', {login: userLoginToDisplay});
                } else {
                    welcomeHeader = this.props.isSmallScreenWidth ? '' : this.props.translate('welcomeText.welcome');
                    welcomeText = this.props.isSmallScreenWidth
                        ? `${this.props.translate('welcomeText.welcome')} ${this.props.translate('welcomeText.newFaceEnterMagicCode', {login: userLoginToDisplay})}`
                        : this.props.translate('welcomeText.newFaceEnterMagicCode', {login: userLoginToDisplay});
                }
            }
        } else if (showPasswordForm) {
            welcomeHeader = this.props.isSmallScreenWidth ? '' : this.props.translate('welcomeText.welcomeBack');
            welcomeText = this.props.isSmallScreenWidth
                ? `${this.props.translate('welcomeText.welcomeBack')} ${this.props.translate('welcomeText.enterPassword')}`
                : this.props.translate('welcomeText.enterPassword');
        } else if (showUnlinkLoginForm) {
            welcomeHeader = this.props.isSmallScreenWidth ? this.props.translate('login.hero.header') : this.props.translate('welcomeText.welcomeBack');
        } else if (!showResendValidationForm) {
            welcomeHeader = this.props.isSmallScreenWidth ? this.props.translate('login.hero.header') : this.props.translate('welcomeText.getStarted');
            welcomeText = this.props.isSmallScreenWidth ? this.props.translate('welcomeText.getStarted') : '';
        }

        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    welcomeHeader={welcomeHeader}
                    welcomeText={welcomeText}
                    shouldShowWelcomeHeader={showLoginForm || showPasswordForm || showValidateCodeForm || showUnlinkLoginForm || !this.props.isSmallScreenWidth}
                    shouldShowWelcomeText={showLoginForm || showPasswordForm || showValidateCodeForm}
                >
                    {/* LoginForm and PasswordForm must use the isVisible prop. This keeps them mounted, but visually hidden
                    so that password managers can access the values. Conditionally rendering these components will break this feature. */}
                    <LoginForm
                        isVisible={showLoginForm}
                        blurOnSubmit={this.props.account.validated === false}
                    />
                    {showValidateCodeForm ? <ValidateCodeForm isVisible={showValidateCodeForm} /> : <PasswordForm isVisible={showPasswordForm} />}
                    {showResendValidationForm && <ResendValidationForm />}
                    {showUnlinkLoginForm && <UnlinkLoginForm />}
                </SignInPageLayout>
            </SafeAreaView>
        );
    }
}

SignInPage.propTypes = propTypes;
SignInPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        betas: {key: ONYXKEYS.BETAS},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(SignInPage);
