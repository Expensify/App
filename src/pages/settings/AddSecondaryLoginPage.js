import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import * as User from '../../libs/actions/User';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import TextInput from '../../components/TextInput';
import userPropTypes from './userPropTypes';
import * as LoginUtils from '../../libs/LoginUtils';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';

const propTypes = {
    /* Onyx Props */
    user: userPropTypes,

    // Route object from navigation
    route: PropTypes.shape({
        // Params that are passed into the route
        params: PropTypes.shape({
            // The type of secondary login to be added (email|phone)
            type: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {},
    route: {},
};

class AddSecondaryLoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
        };
        this.formType = props.route.params.type;
        this.submitForm = this.submitForm.bind(this);
        this.onSecondaryLoginChange = this.onSecondaryLoginChange.bind(this);
        this.validateForm = this.validateForm.bind(this);

        this.phoneNumberInputRef = null;
    }

    componentWillUnmount() {
        User.clearUserErrorMessage();
    }

    onSecondaryLoginChange(login) {
        this.setState({login});
    }

    /**
     * Add a secondary login to a user's account
     */
    submitForm() {
        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtils.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;
        User.setSecondaryLoginAndNavigate(login, this.state.password);
    }

    /**
     * Determine whether the form is valid
     *
     * @returns {Boolean}
     */
    validateForm() {
        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtils.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;

        const validationMethod = this.formType === CONST.LOGIN_TYPE.PHONE ? Str.isValidPhone : Str.isValidEmail;
        return !this.state.password || !validationMethod(login);
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={() => {
                if (!this.phoneNumberInputRef) {
                    return;
                }

                this.phoneNumberInputRef.focus();
            }}
            >
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                            ? 'addSecondaryLoginPage.addPhoneNumber'
                            : 'addSecondaryLoginPage.addEmailAddress')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <Text style={[styles.mb6]}>
                            {this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                ? 'addSecondaryLoginPage.enterPreferredPhoneNumberToSendValidationLink'
                                : 'addSecondaryLoginPage.enterPreferredEmailToSendValidationLink')}
                        </Text>
                        <View style={styles.mb6}>
                            <TextInput
                                label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? 'common.phoneNumber'
                                    : 'profilePage.emailAddress')}
                                ref={el => this.phoneNumberInputRef = el}
                                value={this.state.login}
                                onChangeText={this.onSecondaryLoginChange}
                                keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                                returnKeyType="done"
                            />
                        </View>
                        <View style={styles.mb6}>
                            <TextInput
                                label={this.props.translate('common.password')}
                                value={this.state.password}
                                onChangeText={password => this.setState({password})}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                    </ScrollView>
                    <FormAlertWithSubmitButton
                        isAlertVisible={Boolean(this.props.user.error)}
                        message={this.props.user.error ? this.props.translate(this.props.user.error) : ''}
                        isLoading={this.props.user.loading}
                        buttonText={this.props.translate('addSecondaryLoginPage.sendValidation')}
                        onSubmit={this.submitForm}
                    />
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

AddSecondaryLoginPage.propTypes = propTypes;
AddSecondaryLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(AddSecondaryLoginPage);
