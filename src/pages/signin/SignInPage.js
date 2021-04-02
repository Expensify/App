import React, {Component} from 'react';
import {
    Text,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import updateUnread from '../../libs/UnreadIndicatorUpdater/updateUnread/index';
import SignInPageLayout from './SignInPageLayout';
import LoginForm from './LoginForm';
import PasswordForm from './PasswordForm';
import ResendValidationForm from './ResendValidationForm';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // Whether or not the account already exists
        accountExists: PropTypes.bool,

        // Error to display when there is an account error returned
        error: PropTypes.string,
    }),

    // The credentials of the person signing in
    credentials: PropTypes.shape({
        login: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
    }),

    // The session of the logged in person
    session: PropTypes.shape({
        // Error to display when there is a session error returned
        authToken: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    account: {},
    session: {},
    credentials: {},
};

class SignInPage extends Component {
    componentDidMount() {
        // Always reset the unread counter to zero on this page
        updateUnread(0);
    }

    render() {
        // Show the login form if
        // - A login has not been entered yet
        const showLoginForm = !this.props.credentials.login;

        // Show the password form if
        // - A login has been entered
        // - AND a GitHub username has been entered OR they already have access to expensify cash
        // - AND an account exists already for this login
        // - AND a password hasn't been entered yet
        const showPasswordForm = this.props.credentials.login
            && this.props.account.accountExists
            && !this.props.credentials.password;

        // Show the resend validation link form if
        // - A login has been entered
        // - AND a GitHub username has been entered OR they already have access to this app
        // - AND an account did not exist for that login
        const showResendValidationLinkForm = this.props.credentials.login
            && !this.props.account.accountExists;

        return (
            <>
                <SignInPageLayout
                    showWelcomeText={showLoginForm}
                    showWelcomeScreenshot={showLoginForm}
                >
                    {showLoginForm && <LoginForm />}

                    {showPasswordForm && <PasswordForm />}

                    {showResendValidationLinkForm && <ResendValidationForm />}

                    {/* Because of the custom layout of the login form, session errors are displayed differently */}
                    {!showLoginForm && (
                        <View>
                            {this.props.account && !_.isEmpty(this.props.account.error) && (
                                <Text style={[styles.formError]}>
                                    {this.props.account.error}
                                </Text>
                            )}
                        </View>
                    )}
                </SignInPageLayout>
            </>
        );
    }
}

SignInPage.propTypes = propTypes;
SignInPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        credentials: {key: ONYXKEYS.CREDENTIALS},
        session: {key: ONYXKEYS.SESSION},
    }),
    withWindowDimensions,
)(SignInPage);
