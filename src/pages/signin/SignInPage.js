import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    Image,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import {Redirect} from '../../libs/Router';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import logo from '../../../assets/images/expensify-logo-round.png';
import CustomStatusBar from '../../components/CustomStatusBar';
import updateUnread from '../../libs/UnreadIndicatorUpdater/updateUnread/index';
import LoginForm from './LoginForm';
import GithubUsernameForm from './GithubUsernameForm';
import PasswordForm from './PasswordForm';
import ResendValidationForm from './ResendValidationForm';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // Whether or not the account already exists
        accountExists: PropTypes.bool,

        // Whether or not there have been chat reports shared with this user
        canAccessExpensifyCash: PropTypes.bool,
    }),

    // The credentials of the person signing in
    credentials: PropTypes.shape({
        login: PropTypes.string,
        githubUsername: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
    }),

    // The session of the logged in person
    session: PropTypes.shape({
        // Error to display when there is a session error returned
        error: PropTypes.string,
    }),
};

const defaultProps = {
    account: {},
    session: null,
    credentials: {},
};

class SignInPage extends Component {
    componentDidMount() {
        // Always reset the unread counter to zero on this page
        updateUnread(0);
    }

    render() {
        const session = this.props.session || {};

        // If we end up on the sign in page and have an authToken then
        // we are signed in and should be brought back to the site root
        if (session.authToken) {
            return <Redirect to={ROUTES.ROOT} />;
        }

        // @TODO figure out the real logic that needs to be used for showing the proper form
        // It will depend on if they had an account already, had a Github username already,
        // if they have access to this application, if they need to validate their account, etc.

        // Show the login form if
        // - A login has not been entered yet
        const showLoginForm = !this.props.credentials.login;

        // Show the GitHub username form if
        // - A login has been entered
        // - AND they do not have access to this app yet
        // - AND the user hasn't entered a GitHub username yet
        // - AND a password hasn't been entered yet
        const showGithubUsernameForm = this.props.credentials.login
            && !this.props.account.canAccessExpensifyCash
            && !this.props.credentials.githubUsername
            && !this.props.credentials.password;

        // Show the password form if
        // - A login has been entered
        // - AND a GitHub username has been entered OR they already have access to expensify cash
        // - AND an account exists already for this login
        // - AND a password hasn't been entered yet
        const showPasswordForm = this.props.credentials.login
            && (
                this.props.credentials.githubUsername
                || this.props.account.canAccessExpensifyCash
            )
            && this.props.account.accountExists
            && !this.props.credentials.password;

        // Show the resend validation link form if
        // - A login has been entered
        // - AND a GitHub username has been entered OR they already have access to this app
        // - AND an account did not exist for that login
        const showResendValidationLinkForm = this.props.credentials.login
            && (
                this.props.credentials.githubUsername
                || this.props.account.canAccessExpensifyCash
            )
            && !this.props.account.accountExists;

        return (
            <>
                <CustomStatusBar />
                <SafeAreaView style={[styles.signInPage]}>
                    <View style={[styles.signInPageInner]}>
                        <View style={[styles.signInPageLogo]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinLogo]}
                                source={logo}
                            />
                        </View>

                        {showLoginForm && <LoginForm />}

                        {showGithubUsernameForm && <GithubUsernameForm />}

                        {showPasswordForm && <PasswordForm />}

                        {showResendValidationLinkForm && <ResendValidationForm />}

                        <View>
                            {this.props.session && !_.isEmpty(this.props.session.error) && (
                                <Text style={[styles.formError]}>
                                    {this.props.session.error}
                                </Text>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
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
    })
)(SignInPage);
