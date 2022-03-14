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
        this.setPasswordAndHideFormErrorMessage = this.setPasswordAndHideFormErrorMessage.bind(this);
        this.setConfirmPasswordAndHideFormErrorMessage = this.setConfirmPasswordAndHideFormErrorMessage.bind(this);

        this.password = '';
        this.confirmPassword = '';
        this.isPasswordValid = false;
        this.isConfirmPasswordValid = false;
        this.linkError = '';
        this.formMessage = this.props.translate('setPasswordPage.newPasswordPrompt');

        this.state = {
            showFormError: false,
        };
    }

    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        if (this.props.userSignUp.authToken) {
            return;
        }
        Session.validateEmail(accountID, validateCode);
    }

    setPasswordAndHideFormErrorMessage(text) {
        // Don't disturb user when typing
        this.hideFormError();
        this.password = text;
    }

    setConfirmPasswordAndHideFormErrorMessage(text) {
        // Don't disturb user when typing
        this.hideFormError();
        this.confirmPassword = text;
    }

    /**
    * Display error message for invalid text input value
    *
    * @Returns {undefined}
    */
    displayFormError() {
        // Prevent unncessary render
        if (this.state.showFormError) {
            return;
        }
        this.setState({showFormError: true});
    }

    /**
    * Hide error message for invalid text input value
    *
    * @return {undefined}
    */
    hideFormError() {
        // Prevent unncessary render
        if (!this.state.showFormError) {
            return;
        }
        this.setState({showFormError: false});
    }

    /**
    * Check whether password and confirm pasword is valid
    *
    * @Returns {Boolean}
    */
    validateForm() {
        this.isPasswordValid = this.validatePassword(this.password);
        this.isConfirmPasswordValid = this.validateConfirmPassword(this.password, this.confirmPassword);
        return this.isPasswordValid && this.isConfirmPasswordValid;
    }

    validatePassword(text) {
        return text.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    validateConfirmPassword(password, confirmPassword) {
        return password === confirmPassword;
    }

    validateAndSubmitForm() {
        if (this.linkError || this.props.account.loading || this.props.userSignUp.isValidatingEmail) {
            return;
        }

        if (!this.validateForm()) {
            this.displayFormError();
            return;
        }

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        Session.setOrChangePassword(accountID, validateCode, this.password, this.props.userSignUp.authToken);
        LoginUtil.setPassword(this.password);
    }

    render() {
        const sessionError = this.props.session.error && this.props.translate(this.props.session.error);
        this.linkError = sessionError || this.props.account.error;

        if (!this.isPasswordValid) {
            this.formMessage = this.props.translate('setPasswordPage.newPasswordPrompt');
        } else if (!this.isConfirmPasswordValid) {
            this.formMessage = this.props.translate('setPasswordPage.confirmPasswordInvalidMessage');
        }

        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    shouldShowWelcomeText
                    welcomeText=""
                >
                    {_.isEmpty(this.linkError) ? (
                        <>
                            <Text style={[styles.mtn5]}>
                                {`${this.props.translate('common.welcome')} `}
                                <Text style={[styles.textStrong]}>
                                    {this.props.credentials && this.props.credentials.login}
                                </Text>
                            </Text>
                            <Text style={[styles.mv4]}>
                                {this.props.translate('setPasswordPage.passwordFormTitle')}
                            </Text>

                            <View style={[styles.mb4]}>
                                <TextInput
                                    containerStyles={[styles.mt5]}
                                    label={`${this.props.translate('setPasswordPage.enterPassword')}`}
                                    secureTextEntry
                                    disableShowPasswordButtonTabNavigation
                                    autoCompleteType="password"
                                    textContentType="password"
                                    onChangeText={this.setPasswordAndHideFormErrorMessage}
                                    hasError={this.state.showFormError && !this.isPasswordValid}
                                />
                                <TextInput
                                    containerStyles={[styles.mt3]}
                                    label={this.props.translate('setPasswordPage.confirmPassword')}
                                    secureTextEntry
                                    disableShowPasswordButtonTabNavigation
                                    autoCompleteType="password"
                                    textContentType="password"
                                    value={this.props.password}
                                    onChangeText={this.setConfirmPasswordAndHideFormErrorMessage}
                                    hasError={this.state.showFormError && this.isPasswordValid && !this.isConfirmPasswordValid}
                                    onSubmitEditing={this.validateAndSubmitForm}
                                />
                            </View>
                            <View style={[styles.invalidPasswordMessageSpace]}>
                                <Text style={[styles.formHelp, this.state.showFormError && styles.formError]}>
                                    {this.formMessage}
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
                            <Text>
                                {this.linkError}
                                <br />
                                <TextLink
                                    style={[styles.link]}
                                    href="/"
                                >
                                    {this.props.translate('common.goToHomePage')}
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
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
        session: {
            key: ONYXKEYS.SESSION,
            initWithStoredValues: false,
        },
        userSignUp: {
            key: ONYXKEYS.USER_SIGN_UP,
        },
    }),
)(SetPasswordPage);
