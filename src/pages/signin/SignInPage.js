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

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not the account already exists */
        accountExists: PropTypes.bool,

        /** Error to display when there is an account error returned */
        error: PropTypes.string,

        /** Whether or not the account is validated */
        validated: PropTypes.bool,

        /** Whether or not the account is validated */
        forgotPassword: PropTypes.bool,
    }),

    /** The credentials of the person signing in */
    credentials: PropTypes.shape({
        login: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
    }),

    /** The session of the logged in person */
    session: PropTypes.shape({
        /** Error to display when there is a session error returned */
        authToken: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    session: {},
    credentials: {},
};

class SignInPage extends Component {
    componentDidMount() {
        // Always reset the unread counter to zero on this page
        // NOTE: We need to wait for the next tick to ensure that the unread indicator is updated
        setTimeout(() => updateUnread(0), 0);
    }

    render() {
        // Show the login form if
        // - A login has not been entered yet
        const showLoginForm = !this.props.credentials.login;

        const validAccount = this.props.account.accountExists
            && this.props.account.validated
            && !this.props.account.forgotPassword;

        // Show the password form if
        // - A login has been entered
        // - AND a GitHub username has been entered OR they already have access to New Expensify
        // - AND an account exists and is validated for this login
        // - AND a password hasn't been entered yet
        const showPasswordForm = this.props.credentials.login
            && validAccount
            && !this.props.credentials.password;

        // Show the resend validation link form if
        // - A login has been entered
        // - AND a GitHub username has been entered OR they already have access to this app
        // - AND an account did not exist or is not validated for that login
        const showResendValidationLinkForm = this.props.credentials.login && !validAccount;

        const welcomeText = this.props.translate(`welcomeText.${showPasswordForm ? 'phrase4' : 'phrase1'}`);

        return (
            <>
                <SafeAreaView style={[styles.signInPage]}>
                    <SignInPageLayout
                        welcomeText={welcomeText}
                        shouldShowWelcomeText={showLoginForm}
                        shouldShowWelcomeScreenshot={showLoginForm}
                    >
                        {showLoginForm && <LoginForm />}

                        {showPasswordForm && <PasswordForm />}

                        {showResendValidationLinkForm && <ResendValidationForm />}
                    </SignInPageLayout>
                </SafeAreaView>
            </>
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
        session: {key: ONYXKEYS.SESSION},
    }),
)(SignInPage);
