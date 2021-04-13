import React from 'react';
import {
    Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import themeColors from '../../styles/themes/default';
import {signIn, resetPassword} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // Whether or not the account already exists
        accountExists: PropTypes.bool,

        // Whether or not two factor authentication is required
        requiresTwoFactorAuth: PropTypes.bool,

        // Whether or not a sign on form is loading (being submitted)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {},
};

class PasswordForm extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            password: '',
            twoFactorAuthCode: '',
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.password.trim()
            || (this.props.account.requiresTwoFactorAuth && !this.state.twoFactorAuthCode.trim())
        ) {
            this.setState({formError: 'Please fill out all fields'});
            return;
        }

        this.setState({
            formError: null,
        });

        signIn(this.state.password, this.state.twoFactorAuthCode);
    }

    render() {
        return (
            <>
                <View style={[styles.mb4]}>
                    <Text style={[styles.formLabel]}>Password</Text>
                    <TextInput
                        style={[styles.textInput]}
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        value={this.state.password}
                        onChangeText={text => this.setState({password: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoFocus
                    />
                </View>
                <TouchableOpacity
                    style={[styles.link, styles.mb4]}
                    onPress={resetPassword}
                    underlayColor={themeColors.componentBG}
                >
                    <Text style={[styles.link]}>
                        Forgot?
                    </Text>
                </TouchableOpacity>
                {this.props.account.requiresTwoFactorAuth && (
                    <View style={[styles.mb4]}>
                        <Text style={[styles.formLabel]}>Two Factor Code</Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.state.twoFactorAuthCode}
                            placeholder="Required when 2FA is enabled"
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={text => this.setState({twoFactorAuthCode: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        />
                    </View>
                )}
                <View>
                    <ButtonWithLoader
                        text="Sign In"
                        isLoading={this.props.account.loading}
                        onClick={this.validateAndSubmitForm}
                    />
                    <ChangeExpensifyLoginLink />
                </View>
                {this.state.formError && (
                    <Text style={[styles.formError]}>
                        {this.state.formError}
                    </Text>
                )}
            </>
        );
    }
}

PasswordForm.propTypes = propTypes;
PasswordForm.defaultProps = defaultProps;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(PasswordForm);
