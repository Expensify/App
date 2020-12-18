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
import CONFIG from '../CONFIG';
import compose from '../libs/compose';
import {withRouter, Redirect} from '../libs/Router';
import ROUTES from '../ROUTES';
import {signIn, hasAccount} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import logo from '../../assets/images/expensify-logo-round.png';
import CustomStatusBar from '../components/CustomStatusBar';
import updateUnread from '../libs/UnreadIndicatorUpdater/updateUnread';

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
        // The login that was used when signing in
        login: PropTypes.string,

        // Whether or not the login used for signing in has access to this app
        canAccessCash: PropTypes.bool,
    }),
};

const defaultProps = {
    session: null,
    credentials: null,
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
            isLoading: false,
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
        let formIsValid = true;

        if (!this.state.login.trim()) {
            formIsValid = false;
        }

        if (!formIsValid) {
            this.setState({
                formError: 'Please fill out all fields',
            });
            return;
        }

        // If there is no login in the credentials yet, then check if their account exists and if they have access
        // to this application or not
        if (!this.props.credentials.login) {
            hasAccount(this.state.login);
        }

        // if (this.props.session && this.props.session.loading) {
        //     return;
        // }
        // signIn(this.state.login, this.state.password, this.state.twoFactorAuthCode, this.props.match.params.exitTo);
        this.setState({
            formError: null,
            isLoading: true,
        });
    }

    render() {
        const session = this.props.session || {};

        // If we end up on the sign in page and have an authToken then
        // we are signed in and should be brought back to the site root
        if (session.authToken) {
            return <Redirect to={ROUTES.ROOT} />;
        }

        const isLoading = session.loading;
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
                                placeholder="Enter email or phone"
                            />
                        </View>
                        {/* <View style={[styles.mb4]}>
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
                        */}
                        <View>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess, styles.mb4]}
                                onPress={this.submitForm}
                                underlayColor={themeColors.componentBG}
                                disabled={this.state.isLoading}
                            >
                                {this.state.isLoading ? (
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
