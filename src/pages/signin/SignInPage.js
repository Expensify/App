import React, {Component} from 'react';
import {
    SafeAreaView,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import updateUnread from '../../libs/UnreadIndicatorUpdater/updateUnread/index';
import compose from '../../libs/compose';
import SignInPageLayout from './SignInPageLayout';
import LoginForm from './LoginForm';
import PasswordForm from './PasswordForm';
import ResendValidationForm from './ResendValidationForm';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Performance from '../../libs/Performance';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Error to display when there is an account error returned */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Whether the account is validated */
        validated: PropTypes.bool,
    }),

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
    credentials: {},
};

class SignInPage extends Component {
    componentDidMount() {
        // Always reset the unread counter to zero on this page
        // NOTE: We need to wait for the next tick to ensure that the unread indicator is updated
        setTimeout(() => updateUnread(0), 0);
        Performance.measureTTI();
    }

    render() {
        // Show the login form if
        // - A login has not been entered yet
        const showLoginForm = !this.props.credentials.login;

        // Show the password form if
        // - A login has been entered
        // - AND an account exists and is validated for this login
        // - AND a password hasn't been entered yet
        // - AND haven't forgotten password
        const showPasswordForm = this.props.credentials.login
            && this.props.account.validated
            && !this.props.credentials.password
            && !this.props.account.forgotPassword;

        // Show the resend validation link form if
        // - A login has been entered
        // - AND is not validated or password is forgotten
        const shouldShowResendValidationLinkForm = this.props.credentials.login
            && (!this.props.account.validated || this.props.account.forgotPassword);

        const welcomeText = shouldShowResendValidationLinkForm
            ? ''
            : this.props.translate(`welcomeText.${showPasswordForm ? 'welcomeBack' : 'welcome'}`);

        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    welcomeText={welcomeText}
                    shouldShowWelcomeText={showLoginForm || showPasswordForm || !shouldShowResendValidationLinkForm}
                >
                    {/* LoginForm and PasswordForm must use the isVisible prop. This keeps them mounted, but visually hidden
                    so that password managers can access the values. Conditionally rendering these components will break this feature. */}
                    <LoginForm isVisible={showLoginForm} blurOnSubmit={this.props.account.validated === false} />
                    {/* TODO: if unauthenticated, check GetAccountStatus data */}
                    {/* If authenticated, check beta flag */}
                    {this.props.account.isPasswordless ? (
                        <PasswordForm isVisible={showPasswordForm} />
                    ) : (
                        <ValidateCodeForm />
                    )}
                    {shouldShowResendValidationLinkForm && <ResendValidationForm />}
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
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(SignInPage);
