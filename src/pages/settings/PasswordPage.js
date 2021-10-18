import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Button from '../../components/Button';
import {changePassword} from '../../libs/actions/User';
import {isValidPassword} from '../../libs/ValidationUtils';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import FixedFooter from '../../components/FixedFooter';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import InlineErrorText from '../../components/InlineErrorText';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};
class PasswordPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            errors: {
                currentPassword: false,
                newPassword: false,
                confirmNewPassword: false,
                confirmPasswordMatch: false,
            },
        };

        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.getErrorText = this.getErrorText.bind(this);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.currentPasswordInputRef = null;

        this.errorKeysMap = {
            currentPassword: 'passwordPage.errors.currentPassword',
            confirmNewPassword: 'passwordPage.errors.confirmNewPassword',
        };
    }

    componentWillUnmount() {
        Onyx.merge(ONYXKEYS.ACCOUNT, {error: '', success: ''});
    }

    /**
     * Return the error message for the field
     *
     * @param {String} field
     * @returns {String}
     */
    getErrorText(field) {
        if (this.state.errors[field]) {
            return this.props.translate(this.errorKeysMap[field]);
        }
        return null;
    }


    /**
     * Set value for the field in state and clear error flag
     * @param {String} field
     * @param {String} value
     */
    clearErrorAndSetValue(field, value) {
        this.setState(prevState => ({
            [field]: value,
            errors: {...prevState.errors, [field]: false},
        }));
    }

    /**
     * Validate all fields and submit the form if no errors
     */
    validateAndSubmitForm() {
        const errors = {};

        if (!this.state.currentPassword) {
            errors.currentPassword = true;
        }

        if (!this.state.newPassword || !isValidPassword(this.state.newPassword)) {
            errors.newPassword = true;
        }

        if (!this.state.confirmNewPassword) {
            errors.confirmNewPassword = true;
        }

        if (this.state.currentPassword && this.state.newPassword && this.state.currentPassword === this.state.newPassword) {
            errors.newPassword = true;
        }

        if (this.state.newPassword && this.state.confirmNewPassword && _.isEqual(this.state.newPassword, this.state.confirmNewPassword)) {
            errors.confirmPasswordMatch = true;
        }

        this.setState({errors});
        if (_.isEmpty(errors)) {
            this.handleChangePassword();
        }
    }

    /**
     * API call to change password
     */
    handleChangePassword() {
        changePassword(this.state.currentPassword, this.state.newPassword)
            .then((response) => {
                if (response.jsonCode === 200) {
                    Navigation.navigate(ROUTES.SETTINGS);
                }
            });
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={() => {
                if (this.currentPasswordInputRef) {
                    this.currentPasswordInputRef.focus();
                }
            }}
            >
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('passwordPage.changePassword')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <Text style={[styles.mb6]}>
                            {this.props.translate('passwordPage.changingYourPasswordPrompt')}
                        </Text>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.currentPassword')}*`}
                                ref={el => this.currentPasswordInputRef = el}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.currentPassword}
                                onChangeText={text => this.clearErrorAndSetValue('currentPassword', text)}
                                returnKeyType="done"
                                hasError={this.state.errors.currentPassword}
                                errorText={this.getErrorText('currentPassword')}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.newPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.newPassword}
                                hasError={this.state.errors.newPassword}
                                onChangeText={text => this.clearErrorAndSetValue('newPassword', text)}
                            />
                            <Text
                                style={[
                                    styles.textLabelSupporting,
                                    styles.mt1,
                                    this.state.errors.newPassword && styles.formError,
                                ]}
                            >
                                {this.props.translate('passwordPage.newPasswordPrompt')}
                            </Text>
                        </View>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.confirmNewPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.confirmNewPassword}
                                onChangeText={text => this.clearErrorAndSetValue('confirmNewPassword', text)}
                                hasError={this.state.errors.confirmNewPassword}
                                errorText={this.getErrorText('confirmNewPassword')}
                                onSubmitEditing={this.validateAndSubmitForm}
                            />
                        </View>
                        {!this.state.errors.confirmPasswordMatch && !_.isEmpty(this.props.account.error) && (
                            <Text style={styles.formError}>
                                {this.props.account.error}
                            </Text>
                        )}
                        {this.state.errors.confirmPasswordMatch && (
                            <InlineErrorText>
                                {this.props.translate('setPasswordPage.passwordsDontMatch')}
                            </InlineErrorText>
                        )}
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            style={[styles.mb2]}
                            isLoading={this.props.account.loading}
                            text={this.props.translate('common.save')}
                            onPress={this.validateAndSubmitForm}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PasswordPage.displayName = 'PasswordPage';
PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(PasswordPage);
