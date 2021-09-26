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
import CONST from '../../CONST';
import Button from '../../components/Button';
import {changePassword} from '../../libs/actions/User';
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
            shouldShowPasswordConfirmError: false,
            fieldErrors: {
                currentPassword: null,
                newPassword: null,
                confirmNewPassword: null,
            },
        };

        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.currentPasswordInputRef = null;
    }

    componentWillUnmount() {
        Onyx.merge(ONYXKEYS.ACCOUNT, {error: '', success: ''});
    }


    isValidPassword() {
        return this.state.newPassword.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    getFieldError(field) {
        if (this.state.fieldErrors && this.state.fieldErrors[field]) {
            return this.state.fieldErrors[field];
        }
        return null;
    }

    formatRequiredErrorMessage(label, error) {
        return `${label} ${error}`;
    }

    validateAndSubmitForm() {
        const stateToUpdate = {};
        const fieldErrors = {};

        if (!this.state.currentPassword) {
            fieldErrors.currentPassword = 'common.isRequired';
        }

        if (!this.state.newPassword) {
            fieldErrors.newPassword = 'common.isRequired';
        }

        if (!this.state.confirmNewPassword) {
            fieldErrors.confirmNewPassword = 'common.isRequired';
        }

        if (this.state.newPassword && this.state.confirmNewPassword && !this.doPasswordsMatch()) {
            stateToUpdate.shouldShowPasswordConfirmError = true;
        } else {
            stateToUpdate.shouldShowPasswordConfirmError = false;
        }

        stateToUpdate.errors = fieldErrors;
        this.setState(stateToUpdate);
        if (_.isEmpty(fieldErrors)) {
            this.handleChangePassword();
        }
    }


    handleChangePassword() {
        changePassword(this.state.currentPassword, this.state.newPassword)
            .then((response) => {
                if (response.jsonCode === 200) {
                    Navigation.navigate(ROUTES.SETTINGS);
                }
            });
    }

    doPasswordsMatch() {
        return this.state.newPassword === this.state.confirmNewPassword;
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
                                onChangeText={currentPassword => this.setState({currentPassword})}
                                returnKeyType="done"
                                hasError={this.getFieldError('currentPassword')}
                                errorText={this.formatRequiredErrorMessage('currentPassword', this.getFieldError('currentPassword'))}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.newPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.newPassword}
                                hasError={this.getFieldError('newPassword')}
                                errorText=""
                                onChangeText={newPassword => this.setState({newPassword})}
                            />
                            <Text
                                style={[
                                    styles.textLabelSupporting,
                                    styles.mt1,
                                    this.getFieldError('newPassword') && styles.formError,
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
                                onChangeText={confirmNewPassword => this.setState({confirmNewPassword})}
                                hasError={this.getFieldError('confirmNewPassword')}
                                errorText={this.formatRequiredErrorMessage('confirmNewPassword', this.getFieldError('confirmNewPassword'))}
                                onSubmitEditing={this.validateAndSubmitForm}
                            />
                        </View>
                        {!this.state.shouldShowPasswordConfirmError && !isEmpty(this.props.account.error) && (
                            <Text style={styles.formError}>
                                {this.props.account.error}
                            </Text>
                        )}
                        {this.state.shouldShowPasswordConfirmError && (
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
