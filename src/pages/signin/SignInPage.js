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
import {withOnyx} from 'react-native-onyx';
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

        this.submitForm = this.submitForm.bind(this);

        this.state = {
            login: CONFIG.LOGIN.PARTNER_USER_ID || '',
            password: CONFIG.LOGIN.PARTNER_USER_SECRET || '',
            githubUsername: '',
            twoFactorAuthCode: '',
            formError: null,
        };
    }

    componentDidMount() {
        // Always reset the unread counter to zero on this page
        updateUnread(0);
    }

    /**
     * Sign into the application when the form is submitted
     */
    submitForm() {
        // If there is no login in the credentials yet, validate just the login field and
        // check if their account exists or not
        if (!this.props.credentials.login) {
            if (!this.state.login.trim()) {
                this.setState({formError: 'Please fill out all fields'});
                return;
            }
            hasAccount(this.state.login);
        }

        // If there is a login, then move onto account or login creation
        if (this.props.credentials.login) {
            // If the account did not exist, validate the github username field and
            // then create a new account
            if (!this.props.credentials.hasGithubUsername) {
                if (!this.state.githubUsername.trim()) {
                    this.setState({formError: 'Please fill out all fields'});
                    return;
                }

                // Save the github username for later when creating the account or login
                setGitHubUsername(this.state.githubUsername);
                return;
            }

            // If the account already existed, validate the
            if (!this.state.password.trim() || !this.state.twoFactorAuthCode.trim()) {
                this.setState({formError: 'Please fill out all fields'});
                return;
            }

            if (this.props.credentials.accountExists) {
                // Create login
                // createLogin(this.state.login, this.state.password, this.state.twoFactorAuthCode);
                return;
            }

            // Create account
            createAccount(this.state.login, this.state.password, this.state.twoFactorAuthCode);
        }

        // if (this.props.session && this.props.session.loading) {
        //     return;
        // }
        // signIn(this.state.login, this.state.password, this.state.twoFactorAuthCode, this.props.match.params.exitTo);
        this.setState({
            formError: null,
        });
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
                            <View style={[styles.mb4]}>
                                <Text style={[styles.formLabel]}>Login</Text>
                                <TextInput
                                    style={[styles.textInput]}
                                    value={this.state.login}
                                    autoCompleteType="email"
                                    textContentType="username"
                                    onChangeText={text => this.setState({login: text})}
                                    onSubmitEditing={this.submitForm}
                                    autoCapitalize="none"
                                    placeholder="Email or phone"
                                />
                            </View>
                        )}

                        {this.props.credentials.login && (
                            <>
                                {/* Show the GitHub Username field if the account doesn't have access to this app yet */}
                                {!this.props.credentials.hasGithubUsername && (
                                    <View style={[styles.mb4]}>
                                        <Text style={[styles.formLabel]}>GitHub Username</Text>
                                        <TextInput
                                            style={[styles.textInput]}
                                            value={this.state.githubUsername}
                                            autoCompleteType="email"
                                            textContentType="username"
                                            onChangeText={text => this.setState({githubUsername: text})}
                                            onSubmitEditing={this.submitForm}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                )}

                                {/* Show the password and 2FA fields if there is a github username */}
                                {this.props.credentials.hasGithubUsername && (
                                    <>
                                        <View style={[styles.mb4]}>
                                            <Text style={[styles.formLabel]}>Password</Text>
                                            <TextInput
                                                style={[styles.textInput]}
                                                secureTextEntry
                                                autoCompleteType="password"
                                                textContentType="password"
                                                value={this.state.password}
                                                onChangeText={text => this.setState({password: text})}
                                                onSubmitEditing={this.submitForm}
                                            />
                                        </View>
                                        <View style={[styles.mb4]}>
                                            <Text style={[styles.formLabel]}>Two Factor Code</Text>
                                            <TextInput
                                                style={[styles.textInput]}
                                                value={this.state.twoFactorAuthCode}
                                                placeholder="Required when 2FA is enabled"
                                                placeholderTextColor={themeColors.textSupporting}
                                                onChangeText={text => this.setState({twoFactorAuthCode: text})}
                                                onSubmitEditing={this.submitForm}
                                            />
                                        </View>
                                    </>
                                )}
                            </>
                        )}

                        <View>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess, styles.mb4]}
                                onPress={this.submitForm}
                                underlayColor={themeColors.componentBG}
                                disabled={this.props.session.loading}
                            >
                                {this.props.session.loading ? (
                                    <ActivityIndicator color={themeColors.textReversed} />
                                ) : (
                                    <Text style={[styles.buttonText, styles.buttonSuccessText]}>Log In</Text>
                                )}
                            </TouchableOpacity>
                            {this.props.session && !_.isEmpty(this.props.session.error) && (
                                <Text style={[styles.formError]}>
                                    {this.props.session.error}
                                </Text>
                            )}
                            {this.state.formError && (
                                <Text style={[styles.formError]}>
                                    {this.state.formError}
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
