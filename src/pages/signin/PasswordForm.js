import React from 'react';
import {
    TextInput, TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import themeColors from '../../styles/themes/default';
import {
    resetPassword, signIn, updatePassword, updateTwoFactorAuthCode,
} from '../../libs/actions/Session';
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
        password: PropTypes.string,

        /** TwoFactorAuthCode of the account */
        twoFactorAuthCode: PropTypes.string,

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

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.props.account.password.trim()
            || (this.props.account.requiresTwoFactorAuth && !this.props.account.twoFactorAuthCode.trim())
        ) {
            this.setState({formError: this.props.translate('passwordForm.pleaseFillOutAllFields')});
            return;
        }

        this.setState({
            formError: null,
        });

        signIn(this.props.account.password, this.props.account.twoFactorAuthCode);
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
                        defaultValue={this.props.account.password}
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        onChangeText={updatePassword}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoFocus
                    />
                </View>

                {this.props.account.requiresTwoFactorAuth && (
                    <View style={[styles.mv3]}>
                        <Text style={[styles.formLabel]}>{this.props.translate('passwordForm.twoFactorCode')}</Text>
                        <TextInput
                            style={[styles.textInput]}
                            defaultValue={this.props.account.twoFactorAuthCode}
                            placeholder={this.props.translate('passwordForm.requiredWhen2FAEnabled')}
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={updateTwoFactorAuthCode}
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
