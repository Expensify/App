import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import styles from '../styles/styles';
import Text from '../components/Text';
import TextInput from '../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import Button from '../components/Button';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import FixedFooter from '../components/FixedFooter';
import AvatarWithImagePicker from '../components/AvatarWithImagePicker';
import * as User from '../libs/actions/User';
import currentUserPersonalDetailsPropsTypes from './settings/Profile/currentUserPersonalDetailsPropsTypes';
import LoginUtil from '../libs/LoginUtil';
import NameValuePair from '../libs/actions/NameValuePair';
import * as WelcomeAction from '../libs/actions/WelcomeActions';
import promiseAllSettled from '../libs/promiseAllSettled';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape(currentUserPersonalDetailsPropsTypes),

    /** The details about the user that is signed in */
    user: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    myPersonalDetails: {},
    user: {
        loginList: [],
    },
};

class ProfilePage extends Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);
        this.submitPersonalDetails = this.submitPersonalDetails.bind(this);
        this.submitSecondaryLogin = this.submitSecondaryLogin.bind(this);
        this.handleScreenWillUnmount = this.handleScreenWillUnmount.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleSecondaryLoginChange = this.handleSecondaryLoginChange.bind(this);
        this.displayFormErrorMessage = this.displayFormErrorMessage.bind(this);
        this.hideErrorMessage = this.hideErrorMessage.bind(this);
        this.didNameValid = this.didNameValid.bind(this);
        this.didSecondaryLoginValid = this.didSecondaryLoginValid.bind(this);
        this.didFormValid = this.didFormValid.bind(this);

        this.firstName = '';
        this.isFirstNameValid = true;
        this.lastName = '';
        this.isLastNameValid = true;
        this.secondaryLogin = '';
        this.secondaryLoginError = '';
        this.isLoginValid = true;

        this.password = LoginUtil.getAndDestroyPassword();

        this.state = {
            showFormError: false,
            waitForResponse: false,
            formType: '',
            requestTimeoutError: false,
        };
    }

    componentDidMount() {
        const isSMSLogin = Str.isSMSLogin(this.props.credentials.login);
        const formType = isSMSLogin ? CONST.LOGIN_TYPE.EMAIL : CONST.LOGIN_TYPE.PHONE;
        this.setState({formType});
    }

    didNameValid(name) {
        return _.isEmpty(name) || (name && name.length <= 50);
    }

    didSecondaryLoginValid() {
        if (_.isEmpty(this.secondaryLogin)) { return true; }
        if (this.state.formType === CONST.LOGIN_TYPE.PHONE) {
            const phoneLogin = LoginUtil.getPhoneNumberWithoutSpecialChars(this.secondaryLogin);
            return Str.isValidPhone(phoneLogin);
        }
        return Str.isValidEmail(this.secondaryLogin);
    }

    didFormValid() {
        const nameValid = this.didNameValid(this.firstName) && this.didNameValid(this.lastName);
        return (this.password ? nameValid && this.didSecondaryLoginValid(this.secondaryLogin) : nameValid);
    }

    handleFirstNameChange(text) {
        this.hideErrorMessage();
        this.firstName = text;
        this.isFirstNameValid = this.didNameValid(text);
    }

    handleLastNameChange(text) {
        this.hideErrorMessage();
        this.lastName = text;
        this.isLastNameValid = this.didNameValid(text);
    }

    handleSecondaryLoginChange(text) {
        this.hideErrorMessage();
        this.secondaryLoginError = '';
        this.secondaryLogin = text;
        this.isLoginValid = text.length === 0 || this.didSecondaryLoginValid(text);
    }

    displayFormErrorMessage() {
        if (this.state.showFormError) {
            return;
        }
        this.setState({showFormError: true});
    }

    hideErrorMessage() {
        if (!this.state.showFormError && !this.state.requestTimeoutError) {
            return;
        }
        this.setState({showFormError: false, requestTimeoutError: false});
    }

    /**
     * Handle screen unmount
     */
    handleScreenWillUnmount() {
        // Reset error message
        User.clearUserErrorMessage();

        // Don't set current welcome step if current step isn't equal to welcome profile. Could be direct access to the page by url.
        if (WelcomeAction.getCurrentWelcomeStep() !== CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.WELCOME_PROFILE_SETTING) {
            return;
        }

        // Finish current welcome step and move to next step
        NameValuePair.set(
            CONST.NVP.FIRST_TIME_NEW_EXPENSIFY_USER_STEP,
            CONST.FIRST_TIME_NEW_EXPENSIFY_USER_STEP.GLOBAL_CREATE_MENU,
            ONYXKEYS.NVP_FIRST_TIME_NEW_EXPENSIFY_USER_STEP,
        );
    }

    /**
     * Returns promise of setPersonalDetails request
     * @return {Promise}
     */
    submitPersonalDetails() {
        return PersonalDetails.setPersonalDetails({
            firstName: this.firstName.trim(),
            lastName: this.lastName.trim(),
        }, false);
    }

    /**
     * Returns promise of setSecondaryLogin request
     * @return {Promise}
     */
    submitSecondaryLogin() {
        const login = this.state.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtil.getPhoneNumberWithoutSpecialChars(this.secondaryLogin)
            : this.secondaryLogin;

        return User.setSecondaryLogin(login, this.password);
    }

    /**
     * Submit form to update personal details
     */
    submitForm() {
        if (!this.didFormValid()) {
            this.displayFormErrorMessage();
            return;
        }
        if (this.state.waitForResponse) {
            return;
        }

        // Set loading state of submit button
        this.setState({waitForResponse: true, requestTimeoutError: false});

        let submitPersonalDetailsPromise;
        let submitSecondaryLoginPromise;
        if (this.firstName.trim().length + this.lastName.trim().length > 0) {
            submitPersonalDetailsPromise = this.submitPersonalDetails();
        }

        if (this.secondaryLogin.trim().length > 0) {
            submitSecondaryLoginPromise = this.submitSecondaryLogin();
        }

        // Reject promise request after soome ms
        const rejectAfterDelay = ms => new Promise((resolve, reject) => {
            setTimeout(reject, ms, 'timeout');
        });

        const allpromiseWithTimeout = _.map([submitPersonalDetailsPromise, submitSecondaryLoginPromise], promise => Promise.race([promise, rejectAfterDelay(8000)]));
        promiseAllSettled(allpromiseWithTimeout)
            .then((result) => {
                if (_.some(result, r => r.status === 'rejected' && r.reason === 'timeout')) {
                    this.setState({
                        requestTimeoutError: this.props.translate('welcomeProfilePage.requestTimeoutErrorMessage'),
                        waitForResponse: false,
                    });
                    return;
                }

                this.setState({waitForResponse: false});
                this.secondaryLoginError = submitSecondaryLoginPromise ? lodashGet(this.props.user, 'error', '') : '';
                if (this.secondaryLoginError) {
                    this.displayFormErrorMessage();
                    return;
                }

                this.closeModal();
            });
    }

    closeModal() {
        Navigation.dismissModal(true);
    }

    render() {
        let secondaryLoginErrorMessage = '';
        if (this.state.showFormError && !this.state.requestTimeoutError) {
            if (this.secondaryLoginError) {
                secondaryLoginErrorMessage = this.secondaryLoginError;
            } else if (!this.isLoginValid) {
                secondaryLoginErrorMessage = this.props.translate(this.state.formType === CONST.LOGIN_TYPE.PHONE
                    ? 'messages.errorMessageInvalidPhone'
                    : 'loginForm.error.invalidFormatEmailLogin');
            }
        }

        return (
            <ScreenWrapper
                onWillUnmount={this.handleScreenWillUnmount}
            >
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.welcome')}
                        onCloseButtonPress={this.closeModal}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <Text style={[styles.mb8, styles.mtn4]}>
                            {this.props.translate('welcomeProfilePage.formTitle')}
                        </Text>
                        <AvatarWithImagePicker
                            containerStyles={[styles.mt6]}
                            isUploading={this.props.myPersonalDetails.avatarUploading}
                            avatarURL={this.props.myPersonalDetails.avatar}
                            onImageSelected={PersonalDetails.setAvatar}
                            onImageRemoved={() => PersonalDetails.deleteAvatar(this.props.myPersonalDetails.login)}
                            // eslint-disable-next-line max-len
                            isUsingDefaultAvatar={this.props.myPersonalDetails.avatar.includes('/images/avatars/avatar')}
                            anchorPosition={styles.createMenuPositionProfile}
                            size={CONST.AVATAR_SIZE.LARGE}
                        />
                        <TextInput
                            containerStyles={[styles.mt6]}
                            label={this.props.translate('common.firstName')}
                            onChangeText={this.handleFirstNameChange}
                            errorText={(this.state.showFormError
                                && !this.state.requestTimeoutError
                                && !this.isFirstNameValid
                                ? this.props.translate('personalDetails.error.firstNameLength') : '')}
                        />
                        <TextInput
                            containerStyles={[styles.mt6]}
                            label={this.props.translate('common.lastName')}
                            onChangeText={this.handleLastNameChange}
                            errorText={(this.state.showFormError
                                && !this.state.requestTimeoutError
                                && !this.isLastNameValid
                                ? this.props.translate('personalDetails.error.lastNameLength') : '')}
                            onSubmitEditing={!this.password && this.submitForm}
                        />
                        {this.password && (
                            <TextInput
                                containerStyles={[styles.mt6]}
                                label={this.props.translate(this.state.formType === CONST.LOGIN_TYPE.PHONE
                                    ? 'common.phoneNumber'
                                    : 'profilePage.emailAddress')}
                                onChangeText={this.handleSecondaryLoginChange}
                                keyboardType={this.state.formType === CONST.LOGIN_TYPE.PHONE
                                    ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                                errorText={secondaryLoginErrorMessage}
                                onSubmitEditing={this.submitForm}
                                returnKeyType="done"
                            />
                        )}
                        {this.state.requestTimeoutError && (
                            <View style={[styles.mt4]}>
                                <Text style={[styles.formError]}>
                                    {this.state.requestTimeoutError}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            success
                            isLoading={this.state.waitForResponse}
                            onPress={this.submitForm}
                            style={[styles.w100]}
                            text={this.props.translate('common.getStarted')}
                            pressOnEnter
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

ProfilePage.propTypes = propTypes;
ProfilePage.defaultProps = defaultProps;
ProfilePage.displayName = 'ProfilePage';

export default compose(
    withLocalize,
    withOnyx({
        credentials: {
            key: ONYXKEYS.CREDENTIALS,
        },
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(ProfilePage);
