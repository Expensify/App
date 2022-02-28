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
import TextLink from '../components/TextLink';
import CONST from '../CONST';
import LoginUtil from '../libs/LoginUtil';

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
    account: {validated: true},
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
        this.displayFormError = this.displayFormError.bind(this);
        this.hideFormError= this.hideFormError.bind(this);

        this.password = '';
        this.confirmPassword = '';
        this.isPasswordValid = false;
        this.isConfirmPasswordValid = false;
        this.linkError = '';

        this.state = {
            showFormError: false,
        }
    }

    validatePassword(text) {
        return text.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    validateConfirmPassword(text) {
        return text === this.password;
    }

    // Check whether password and confirm pasword is valid
    isFormValid() {
        return this.validatePassword(this.password) && this.validateConfirmPassword(this.confirmPassword);
    }

    handlePasswordChange(text) {
        // Don't disturb user when typing
        this.hideFormError();
        this.password = text;
        this.isPasswordValid = this.validatePassword(text);
    }

    handleConfirmPasswordChange(text) {
        // Don't disturb user when typing
        this.hideFormError();
        this.confirmPassword = text;
        this.isConfirmPasswordValid = this.validateConfirmPassword(text);
    }

    // Display error message for invalid text input value
    displayFormError() {
        // Prevent unncessary render
        if (this.state.showFormError) {
            return;
        }
        this.setState({showFormError: true});
    }
    
    // Hide error message for invalid text input value
    hideFormError() {
        // Prevent unncessary render
        if (!this.state.showFormError) {
            return;
        }
        this.setState({showFormError: false});
    }

    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        Session.validateEmail(accountID, validateCode);
    }

    validateAndSubmitForm() {
        if (this.linkError) {
            return;
        }

        if (!this.isFormValid()) {
            this.displayFormError();
            return;
        }

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        Session.setOrChangePassword(accountID, validateCode, this.password, this.props.userSignUp.authToken);
        LoginUtil.storePassword(this.password);
    }


    render() {
        const sessionError = this.props.session.error && this.props.translate(this.props.session.error);
        this.linkError = sessionError || this.props.account.error;
        let errorText = '';
        // Prioritize link error message
        if (!this.isPasswordValid) {
            errorText = this.props.translate('setPasswordPage.newPasswordPrompt');
        } else if (!this.isConfirmPasswordValid) {
            errorText =  this.props.translate('setPasswordPage.confirmPasswordInvalidMessage');
        } else {
            //no error show default message
            errorText = this.props.translate('setPasswordPage.newPasswordPrompt');
        } 
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    shouldShowWelcomeText
                    welcomeText={''}
                >
                    {_.isEmpty(this.linkError) ? (
                        <>
                            <Text style={[styles.mtn5]}>
                                {`${this.props.translate('common.welcome')} `}
                                <Text style={[styles.textStrong]}>
                                    {this.props.credentials && this.props.credentials.login} 
                                </Text>
                            </Text>
                            <Text style={[styles.mv4, ]}>
                                {this.props.translate('setPasswordPage.passwordFormTitle')} 
                            </Text>
                            
                            <View style={[styles.mb4]}>
                                <TextInput
                                    containerStyles={[styles.mt5]}
                                    label={`${this.props.translate('setPasswordPage.enterPassword')}`}
                                    secureTextEntry
                                    autoCompleteType="password"
                                    textContentType="password"
                                    onChangeText={this.handlePasswordChange}
                                    // Only show error if there is no link error
                                    hasError={this.state.showFormError && !this.isPasswordValid}
                                />
                                <TextInput
                                    containerStyles={[styles.mt3]}
                                    label={this.props.translate('setPasswordPage.confirmPassword')}
                                    secureTextEntry
                                    autoCompleteType="password"
                                    textContentType="password"
                                    value={this.props.password}
                                    onChangeText={this.handleConfirmPasswordChange}
                                    // Only show error if there is no link error
                                    hasError={this.state.showFormError && !this.isConfirmPasswordValid}
                                    onSubmitEditing={this.validateAndSubmitForm}
                                />
                            </View>
                            <View style={[styles.invalidPasswordMessageSpace]}> 
                                <Text style={[styles.formHelp, this.state.showFormError && styles.formError]}>
                                    {errorText}
                                </Text>
                            </View>
                            <View>
                                <Button
                                    success
                                    style={[styles.mb2]}
                                    text={this.props.translate('common.getStarted')}
                                    isLoading={this.props.account.loading || this.props.userSignUp.isValidatingEmail}
                                    onPress={this.validateAndSubmitForm}
                                />
                            </View>
                        </>
                    )
                        : (
                              <Text>{this.linkError}
                                  <br/>
                                  <TextLink style={[styles.link]}
                                      href={'/'}
                                  >{this.props.translate('common.goToHomePage')}
                                  </TextLink>
                              </Text>
                        )}
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
        credentials: {
            key: ONYXKEYS.CREDENTIALS,
            initWithStoredValues: false,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
            initWithStoredValues: false,
        },
        session: {
            key: ONYXKEYS.SESSION,
            initWithStoredValues: false,
        },
        userSignUp: {
            key: ONYXKEYS.USER_SIGN_UP,
            initWithStoredValues: false,
        },
    }),
)(SetPasswordPage);
