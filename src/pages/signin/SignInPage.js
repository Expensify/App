import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    View,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx, Onyx} from 'react-native-onyx';
import CONFIG from '../../CONFIG';
import compose from '../../libs/compose';
import {withRouter, Redirect} from '../../libs/Router';
import ROUTES from '../../ROUTES';
import {signIn, hasAccount, setGitHubUsername} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import logo from '../../../assets/images/expensify-logo-round.png';
import CustomStatusBar from '../../components/CustomStatusBar';
import updateUnread from '../../libs/UnreadIndicatorUpdater/updateUnread/index';
import LoginForm from './LoginForm';
import GithubUsernameForm from './GithubUsernameForm';
import PasswordForm from './PasswordForm';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Onyx Props */

    // The session of the logged in person
    session: PropTypes.shape({
        // Error to display when there is a session error returned
        error: PropTypes.string,

        // Stores if we are currently making an authentication request
        loading: PropTypes.bool,
    }),

    // The credentials of the person signing in
    credentials: PropTypes.shape({
        // Whether or not the login that was entered has an existing account
        accountExists: PropTypes.string,

        // The login that was used when signing in
        login: PropTypes.string,

        // Whether or not the login used for signing in has a GitHub username
        hasGithubUsername: PropTypes.bool,
    }),
};

const defaultProps = {
    session: null,
    credentials: {},
};

class App extends Component {
    constructor(props) {
        super(props);

        this.submitLoginForm = this.submitLoginForm.bind(this);
        this.submitGithubUsernameForm = this.submitGithubUsernameForm.bind(this);
        this.submitPasswordForm = this.submitPasswordForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {
        // Always reset the unread counter to zero on this page
        updateUnread(0);
    }

    submitLoginForm({login}) {
        Onyx.merge(ONYXKEYS.CREDENTIALS, {login});
    }

    submitGithubUsernameForm({githubUsername}) {
        Onyx.merge(ONYXKEYS.CREDENTIALS, {githubUsername});
    }

    submitPasswordForm({password, twoFactorAuthCode}) {
        Onyx.merge(ONYXKEYS.CREDENTIALS, {password, twoFactorAuthCode});
    }

    render() {
        const session = this.props.session || {};

        // If we end up on the sign in page and have an authToken then
        // we are signed in and should be brought back to the site root
        if (session.authToken) {
            return <Redirect to={ROUTES.ROOT} />;
        }

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

                        {/* Show the input for collecting the login when there is no login. */}
                        {!this.props.credentials.login
                            && !this.props.credentials.githubUsername
                            && !this.props.credentials.password && (
                            <LoginForm onSubmit={this.submitLoginForm} />
                        )}

                        {this.props.credentials.login && (
                            <>
                                {/* Show the GitHub Username field if the account doesn't have access to this app yet */}
                                {!this.props.credentials.hasGithubUsername && (
                                    <GithubUsernameForm onSubmit={this.submitGithubUsernameForm} />
                                )}

                                {/* Show the password and 2FA fields if there is a github username */}
                                {this.props.credentials.hasGithubUsername && (
                                    <PasswordForm onSubmit={this.submitPasswordForm} />
                                )}
                            </>
                        )}

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

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default compose(
    withRouter,
    withOnyx({
        session: {key: ONYXKEYS.SESSION},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    })
)(App);
