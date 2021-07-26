import React from 'react';
import {
    TextInput, TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import themeColors from '../../styles/themes/default';
import {resetPassword} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {

    onSubmitPassword: PropTypes.func.isRequired,

    onChangePassword: PropTypes.func.isRequired,

    onChangeTwoFactorAuthCode: PropTypes.func.isRequired,

    password: PropTypes.string,

    twoFactorAuthCode: PropTypes.string,

    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
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
    password: '',
    twoFactorAuthCode: '',
    account: {},

};

class PasswordForm extends React.Component {
    constructor(props) {
        super(props);

        this.onChangePassword = this.props.onChangePassword.bind(this);
        this.onChangeTwoFactorAuthCode = this.props.onChangeTwoFactorAuthCode.bind(this);
        this.validateAndSubmitForm = this.props.onSubmitPassword.bind(this);
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
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        value={this.props.password}
                        onChangeText={this.props.onChangePassword}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoFocus
                    />
                </View>

                {this.props.account.requiresTwoFactorAuth && (
                    <View style={[styles.mv3]}>
                        <Text style={[styles.formLabel]}>{this.props.translate('passwordForm.twoFactorCode')}</Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.props.twoFactorAuthCode}
                            placeholder={this.props.translate('passwordForm.requiredWhen2FAEnabled')}
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={this.props.onChangeTwoFactorAuthCode}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        />

                    </View>
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
                {this.props.passwordError && (
                    <Text style={[styles.formError]}>
                        {this.props.passwordError}
                    </Text>
                )}
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
