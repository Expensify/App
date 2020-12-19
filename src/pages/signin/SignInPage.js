import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    Image,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Onyx, {withOnyx} from 'react-native-onyx';
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

const propTypes = {
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
        login: PropTypes.string,
        githubUsername: PropTypes.string,
        password: PropTypes.string,
        twoFactorAuthCode: PropTypes.string,
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

        const showLoginForm = !this.props.credentials.login
            && !this.props.credentials.githubUsername
            && !this.props.credentials.password;

        const showGithubUsernameForm = this.props.credentials.login
            && !this.props.credentials.githubUsername
            && !this.props.credentials.password;

        const showPasswordForm = this.props.credentials.login
            && this.props.credentials.githubUsername
            && !this.props.credentials.password;

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

                        {showLoginForm && (
                            <LoginForm onSubmit={this.submitLoginForm} />
                        )}

                        {showGithubUsernameForm && (
                            <GithubUsernameForm onSubmit={this.submitGithubUsernameForm} />
                        )}

                        {showPasswordForm && (
                            <PasswordForm onSubmit={this.submitPasswordForm} />
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
    withOnyx({
        session: {key: ONYXKEYS.SESSION},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    })
)(App);
