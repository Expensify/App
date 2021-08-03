import React from 'react';
import {
    TextInput, TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import themeColors from '../../styles/themes/default';
import {signIn, resetPassword} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({

        /** Password of the account */
        password: PropTypes.string.isRequired,

        /** Whether or not the account already exists */
        accountExists: PropTypes.bool,

        /** Whether or not two factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {
        password: '',
        twoFactorAuthCode: '',
    },
};

class PasswordForm extends React.Component {
    constructor(props) {
        super(props);

        this.changePassword = this.changePassword.bind(this);
        this.changeTwoFactorAuthCode = this.changeTwoFactorAuthCode.bind(this);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.password = props.account.password;
        this.twoFactorAuthCode = props.account.twoFactorAuthCode;


        this.state = {
            formError: false,
        };
    }

    /**
     * Update the value of password in Onyx
     *
     * @param {String} newPassword
     */
    changePassword(newPassword) {
        this.password = newPassword;
        Onyx.merge(ONYXKEYS.ACCOUNT, {password: newPassword});
    }

    /**
     * Update the value of twoFactorAuthCode in Onyx
     *
     * @param {String} newTwoFactorAuthCode
     */
    changeTwoFactorAuthCode(newTwoFactorAuthCode) {
        this.TwoFactorAuth = newTwoFactorAuthCode;
        Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthCode: newTwoFactorAuthCode});
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.password.trim()
            || (this.props.account.requiresTwoFactorAuth && !this.twoFactorAuthCode.trim())
        ) {
            this.setState({formError: this.props.translate('passwordForm.pleaseFillOutAllFields')});
            return;
        }

        this.setState({
            formError: null,
        });

        signIn(this.password, this.twoFactorAuthCode);
    }

    render() {
        return (
            <>
                <View style={[styles.mv3]}>
                    <View style={[styles.dFlex, styles.flexRow]}>
                        <Text style={[styles.formLabel]}>{this.props.translate('common.password')}</Text>
                        <TouchableOpacity
                            style={[styles.ml2]}
                            onPress={resetPassword}
                            underlayColor={themeColors.componentBG}
                        >
                            <Text style={[styles.link, styles.h4]}>
                                {this.props.translate('passwordForm.forgot')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.textInput]}
                        ref={this.password}
                        value={this.password}
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        onChangeText={this.changePassword}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoFocus
                    />
                </View>

                {this.props.account.requiresTwoFactorAuth && (
                    <View style={[styles.mv3]}>
                        <Text style={[styles.formLabel]}>{this.props.translate('passwordForm.twoFactorCode')}</Text>
                        <TextInput
                            style={[styles.textInput]}
                            ref={this.twoFactorAuthCode}
                            value={this.twoFactorAuthCode}
                            placeholder={this.props.translate('passwordForm.requiredWhen2FAEnabled')}
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={this.changeTwoFactorAuthCode}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        />
                    </View>
                )}

                {this.state.formError && (
                <Text style={[styles.formError]}>
                    {this.state.formError}
                </Text>
                )}

                {!_.isEmpty(this.props.account.error) && (
                <Text style={[styles.formError]}>
                    {this.props.account.error}
                </Text>
                )}

                {!_.isEmpty(this.props.account.success) && (
                <Text style={[styles.formSuccess]}>
                    {this.props.account.success}
                </Text>
                )}

                <View>
                    <Button
                        success
                        style={[styles.mv3]}
                        text={this.props.translate('common.signIn')}
                        isLoading={this.props.account.loading}
                        onPress={this.validateAndSubmitForm}
                    />
                    <ChangeExpensifyLoginLink />
                </View>
            </>
        );
    }
}

PasswordForm.propTypes = propTypes;
PasswordForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(PasswordForm);
