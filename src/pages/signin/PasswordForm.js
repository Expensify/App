import React from 'react';
import {Text, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import themeColors from '../../styles/themes/default';
import ONYXKEYS from '../../ONYXKEYS';
import {signIn} from '../../libs/actions/Session';

const propTypes = {
    // A function that is called when the form is submitted
    onSubmit: PropTypes.func.isRequired,
};

class PasswordForm extends React.Component {
    constructor() {
        super();

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            password: '',
            twoFactorAuthCode: '',
            isLoading: false,
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.password.trim() || !this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: 'Please fill out all fields'});
            return;
        }

        this.setState({
            formError: null,
            isLoading: true,
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
                    />
                </View>
                <View style={[styles.mb4]}>
                    <Text style={[styles.formLabel]}>Two Factor Code</Text>
                    <TextInput
                        style={[styles.textInput]}
                        value={this.state.twoFactorAuthCode}
                        placeholder="Required when 2FA is enabled"
                        placeholderTextColor={themeColors.textSupporting}
                        onChangeText={text => this.setState({twoFactorAuthCode: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                    />
                </View>
                <View>
                    <SubmitButton
                        text="Sign In"
                        isLoading={this.state.isLoading}
                        onClick={this.validateAndSubmitForm}
                    />
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

export default PasswordForm;
