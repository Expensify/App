import React, {Component} from 'react';
import {
    SafeAreaView,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
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
import Permissions from '../../libs/Permissions';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Error to display when there is an account error returned */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Whether the account is validated */
        validated: PropTypes.bool,
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
};

const defaultProps = {
    account: {},
    betas: [],
    credentials: {},
};

class SignInPage extends Component {
    componentDidMount() {
        Performance.measureTTI();
    }

    render() {
        // Show the login form if
        // - A login has not been entered yet
        const showLoginForm = !this.props.credentials.login;

        // Show the old password form if
        // - A login has been entered
        // - AND an account exists and is validated for this login
        // - AND a password hasn't been entered yet
        // - AND haven't forgotten password
        // - AND the user is NOT on the passwordless beta
        const showPasswordForm = this.props.credentials.login
            && this.props.account.validated
            && !this.props.credentials.password
            && !this.props.account.forgotPassword
            && !Permissions.canUsePasswordlessLogins(this.props.betas);

        // Show the new magic code / validate code form if
        // - A login has been entered
        // - AND the user is on the 'passwordless' beta
        const showValidateCodeForm = this.props.credentials.login
            && Permissions.canUsePasswordlessLogins(this.props.betas);

        // Show the resend validation link form if
        // - A login has been entered
        // - AND is not validated or password is forgotten
        // - AND user is not on 'passwordless' beta
        const showResendValidationForm = this.props.credentials.login
            && (!this.props.account.validated || this.props.account.forgotPassword)
            && !Permissions.canUsePasswordlessLogins(this.props.betas);

        let welcomeText = '';
        if (showValidateCodeForm) {
            if (this.props.account.requiresTwoFactorAuth) {
                // We will only know this after a user signs in successfully, without their 2FA code
                welcomeText = this.props.translate('validateCodeForm.enterTwoFactorOrRecoveryCode');
            } else {
                welcomeText = this.props.account.validated
                    ? this.props.translate('welcomeText.welcomeBackEnterMagicCode', {login: this.props.credentials.login})
                    : this.props.translate('welcomeText.welcomeEnterMagicCode', {login: this.props.credentials.login});
            }
        } else if (showPasswordForm) {
            welcomeText = this.props.translate('welcomeText.welcomeBack');
        } else if (!showResendValidationForm) {
            welcomeText = this.props.translate('welcomeText.welcome');
        }

        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    welcomeText={welcomeText}
                    shouldShowWelcomeText={showLoginForm || showPasswordForm || showValidateCodeForm || !showResendValidationForm}
                >
                    {/* LoginForm and PasswordForm must use the isVisible prop. This keeps them mounted, but visually hidden
                    so that password managers can access the values. Conditionally rendering these components will break this feature. */}
                    <LoginForm isVisible={showLoginForm} blurOnSubmit={this.props.account.validated === false} />
                    {showValidateCodeForm ? (
                        <ValidateCodeForm isVisible={showValidateCodeForm} />
                    ) : (
                        <PasswordForm isVisible={showPasswordForm} />
                    )}
                    {showResendValidationForm && <ResendValidationForm />}
                </SignInPageLayout>
            </SafeAreaView>
        );
    }
}

SignInPage.propTypes = propTypes;
SignInPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        betas: {key: ONYXKEYS.BETAS},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(SignInPage);
