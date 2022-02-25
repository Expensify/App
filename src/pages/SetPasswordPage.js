import React, {Component} from 'react';
import {
    SafeAreaView,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import styles from '../styles/styles';
import * as Session from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import Button from '../components/Button';
import SignInPageLayout from './signin/SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import NewPasswordForm from './settings/NewPasswordForm';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import CONST from '../CONST';
import * as LoginUtil from '../libs/LoginUtil';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,

        /** The password used to log in the user */
        password: PropTypes.string,
    }),

    /** Session object */
    session: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,
    }),

    /** User signup object */
    userSignUp: PropTypes.shape({
        /** Is Validating Email */
        isValidating: PropTypes.bool,

        /** Auth token used to change password */
        authToken: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
    route: validateLinkDefaultProps,
    session: {
        error: '',
        authToken: '',
    },
    userSignUp: {
        isValidating: false,
        authToken: '',
    },
};

class SetPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.isFormValid = this.isFormValid.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.validateConfirmPassword = this.validateConfirmPassword.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);

        this.password = '';
        this.confirmPassword = '';
        this.isPasswordValid = false;
        this.isConfirmPasswordValid = false;

        this.state = {
            showError: false,
        }
    }

    validatePassword(text) {
        return text.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    validateConfirmPassword(text) {
        return text === this.password;
    }

    isFormValid() {
        return this.validatePassword(this.password) && this.validateConfirmPassword(this.confirmPassword);
    }

    handlePasswordChange(text) {
        if (this.state.showError) { this.setState({showError: false}) };
        console.log(text);
        this.password = text;
        this.isPasswordValid = text.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
        //if (this.isPasswordValid !== isvalid) {
        //    this.setState({isPasswordValid: isvalid});
        //}
    }

    handleConfirmPasswordChange(text) {
        if (this.state.showError) { this.setState({showError: false}) };
        this.confirmPassword = text;
        this.isConfirmPasswordValid = text === this.password;
        //if (this.isConfirmPasswordValid !== isvalid) {
        //    this.setState({isConfirmPasswordValid: isvalid});
        //}
    }

    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        if (this.props.userSignUp.authToken) {
            return;
        }
        Session.validateEmail(accountID, validateCode);
    }

    validateAndSubmitForm() {
        if (!this.isFormValid()) {
            console.log('going here dazo');
            this.setState({showError: true});
            return;
        }

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        //Session.setOrChangePassword(accountID, validateCode, this.password, this.props.userSignUp.authToken);
        LoginUtil.setPassword(this.password);
    }


    render() {
        const buttonText = this.props.userSignUp.isValidating ? this.props.translate('setPasswordPage.verifyingAccount') : this.props.translate('setPasswordPage.setPassword');
        const sessionError = this.props.session.error && this.props.translate(this.props.session.error);
        const error = sessionError || this.props.account.error;
        let errorText = '';
        if (!this.isPasswordValid) {
            errorText = this.props.translate('setPasswordPage.newPasswordPrompt');
        } else if (!this.isConfirmPasswordValid) {
            errorText = "Make sure confirm password is match";
        } if (sessionError) {
            errorText = sessionError
        }

        // {_.isEmpty(error) ? (
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    shouldShowWelcomeText
                    welcomeText={''}
                >
                    {true ? (
                        <>
                            <Text style={[styles.mtn5]}>
                                {'Welcome '} 
                                <Text style={[styles.textStrong]}>
                                    {this.props.credentials.login} 
                                </Text>
                            </Text>
                            <Text style={[styles.mv4, ]}>
                                {'Please set a password below to sign into your account'} 
                            </Text>
                            
                            <View style={[styles.mb4]}>
                                <TextInput
                                    containerStyles={[styles.mt5]}
                                    label={`${this.props.translate('setPasswordPage.enterPassword')}`}
                                    secureTextEntry
                                    autoCompleteType="password"
                                    textContentType="password"
                                    onChangeText={this.handlePasswordChange}
                                    hasError={this.state.showError && !this.isPasswordValid}
                                    //hasError={this.state.showError && !this.isPasswordValid}
                                />
                                <TextInput
                                    containerStyles={[styles.mt3]}
                                    label={`Confirm Password`}
                                    secureTextEntry
                                    autoCompleteType="password"
                                    textContentType="password"
                                    value={this.props.password}
                                    onChangeText={this.handleConfirmPasswordChange}
                                    hasError={this.state.showError && !this.isConfirmPasswordValid}
                                    //onSubmitEditing={() => this.props.onSubmitEditing()}

                                    //password={this.state.password}
                                    //updatePassword={password => this.setState({password})}
                                    //updateIsFormValid={isValid => this.setState({isFormValid: isValid})}
                                    //onSubmitEditing={this.validateAndSubmitForm}
                                />
                            </View>
                            <View style={[{height: 60}]}> 
                                <Text style={[styles.formHelp, this.state.showError && styles.formError]}>
                                    {errorText}
                                </Text>
                            </View>
                            <View>
                                <Button
                                    success
                                    style={[styles.mb2]}
                                    text={buttonText}
                                    isLoading={this.props.account.loading || this.props.userSignUp.isValidatingEmail}
                                    onPress={this.validateAndSubmitForm}
                                    //isDisabled={!this.state.isFormValid}
                                />
                            </View>
                        </>
                    )
                        : (<Text>{error}</Text>)}
                </SignInPageLayout>
            </SafeAreaView>
        );
    }
}

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
        session: {
            key: ONYXKEYS.SESSION,
            initWithStoredValues: false,
        },
        userSignUp: {key: ONYXKEYS.USER_SIGN_UP},
    }),
)(SetPasswordPage);
