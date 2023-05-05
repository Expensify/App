import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Button from '../../components/Button';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as User from '../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import FixedFooter from '../../components/FixedFooter';
import TextInput from '../../components/TextInput';
import * as Session from '../../libs/actions/Session';
import * as ErrorUtils from '../../libs/ErrorUtils';
import ConfirmationPage from '../../components/ConfirmationPage';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
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
            errors: {
                currentPassword: false,
                newPassword: false,
                newPasswordSameAsOld: false,
            },
        };

        this.submit = this.submit.bind(this);
        this.getErrorText = this.getErrorText.bind(this);
        this.validate = this.validate.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);

        this.errorKeysMap = {
            currentPassword: 'passwordPage.errors.currentPassword',
            newPasswordSameAsOld: 'passwordPage.errors.newPasswordSameAsOld',
            newPassword: 'passwordPage.errors.newPassword',
        };
    }

    componentWillUnmount() {
        Session.clearAccountMessages();
    }

    /**
     * @param {String} field
     * @returns {String}
     */
    getErrorText(field) {
        if (this.state.errors[field]) {
            return this.props.translate(this.errorKeysMap[field]);
        }
        return '';
    }

    /**
     * @param {String} field
     * @param {String} value
     * @param {String[]} additionalErrorsToClear
     */
    clearErrorAndSetValue(field, value, additionalErrorsToClear) {
        const errorsToReset = {
            [field]: false,
        };
        if (additionalErrorsToClear) {
            _.each(additionalErrorsToClear, (errorFlag) => {
                errorsToReset[errorFlag] = false;
            });
        }

        this.setState(prevState => ({
            [field]: value,
            errors: {...prevState.errors, ...errorsToReset},
        }));
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        if (!this.state.currentPassword) {
            errors.currentPassword = true;
        }

        if (!this.state.newPassword || !ValidationUtils.isValidPassword(this.state.newPassword)) {
            errors.newPassword = true;
        }

        if (this.state.currentPassword && this.state.newPassword && _.isEqual(this.state.currentPassword, this.state.newPassword)) {
            errors.newPasswordSameAsOld = true;
        }

        this.setState({errors});
        return _.size(errors) === 0;
    }

    /**
     * Submit the form
     */
    submit() {
        if (!this.validate()) {
            return;
        }
        User.updatePassword(this.state.currentPassword, this.state.newPassword);
    }

    render() {
        const shouldShowNewPasswordPrompt = !this.state.errors.newPassword && !this.state.errors.newPasswordSameAsOld;
        return (
            <ScreenWrapper onEntryTransitionEnd={() => {
                if (!this.currentPasswordInputRef) {
                    return;
                }

                this.currentPasswordInputRef.focus();
            }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('passwordPage.changePassword')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                {!_.isEmpty(this.props.account.success)
                    ? (
                        <ConfirmationPage
                            heading={this.props.translate('passwordConfirmationScreen.passwordUpdated')}
                            shouldShowButton
                            onButtonPress={Navigation.goBack}
                            buttonText={this.props.translate('passwordConfirmationScreen.gotIt')}
                            description={this.props.translate('passwordConfirmationScreen.allSet')}
                        />
                    ) : (
                        <>
                            <ScrollView
                                style={styles.flex1}
                                contentContainerStyle={styles.p5}

                                // Allow the user to click show password while password input is focused.
                                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                                keyboardShouldPersistTaps="always"
                            >
                                <Text style={[styles.mb6]}>
                                    {this.props.translate('passwordPage.changingYourPasswordPrompt')}
                                </Text>
                                <View style={styles.mb6}>
                                    <TextInput
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
                                        onSubmitEditing={this.submit}
                                    />
                                </View>
                                <View style={styles.mb6}>
                                    <TextInput
                                        label={`${this.props.translate('passwordPage.newPassword')}*`}
                                        secureTextEntry
                                        autoCompleteType="password"
                                        textContentType="password"
                                        value={this.state.newPassword}
                                        hasError={this.state.errors.newPassword || this.state.errors.newPasswordSameAsOld}
                                        errorText={this.state.errors.newPasswordSameAsOld
                                            ? this.getErrorText('newPasswordSameAsOld')
                                            : this.getErrorText('newPassword')}
                                        onChangeText={text => this.clearErrorAndSetValue('newPassword', text, ['newPasswordSameAsOld'])}
                                        onSubmitEditing={this.submit}
                                    />
                                    {shouldShowNewPasswordPrompt && (
                                    <Text
                                        style={[
                                            styles.textLabelSupporting,
                                            styles.mt1,
                                        ]}
                                    >
                                        {this.props.translate('passwordPage.newPasswordPrompt')}
                                    </Text>
                                    )}
                                </View>
                                {_.every(this.state.errors, error => !error) && !_.isEmpty(this.props.account.errors) && (
                                <Text style={styles.formError}>
                                    {ErrorUtils.getLatestErrorMessage(this.props.account)}
                                </Text>
                                )}
                            </ScrollView>
                            <FixedFooter style={[styles.flexGrow0]}>
                                <Button
                                    success
                                    isLoading={this.props.account.isLoading}
                                    text={this.props.translate('common.save')}
                                    onPress={this.submit}
                                />
                            </FixedFooter>
                        </>
                    )}
            </ScreenWrapper>
        );
    }
}

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
