import React from 'react';
import PropTypes from 'prop-types';
import {TextInput, View} from 'react-native';
import Text from '../../components/Text';
import withLocalize, {
    withLocalizePropTypes,
} from '../../components/withLocalize';
import CONST from '../../CONST';
import styles from '../../styles/styles';

const propTypes = {
    /** String to control the first password box in the form */
    password: PropTypes.string.isRequired,

    /** Function to update the first password box in the form */
    updatePassword: PropTypes.func.isRequired,

    /** Callback function called with boolean value for if the password form is valid  */
    updateIsFormValid: PropTypes.func.isRequired,

    /** Callback function for when form is submitted  */
    onSubmitEditing: PropTypes.func.isRequired,
    ...withLocalizePropTypes,
};

class NewPasswordForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmNewPassword: '',
            passwordHintError: false,
            shouldShowPasswordConfirmError: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const eitherPasswordChanged = this.props.password
        !== prevProps.password || this.state.confirmNewPassword !== prevState.confirmNewPassword;
        if (eitherPasswordChanged) {
            this.props.updateIsFormValid(this.isValidForm());
        }
    }

    onBlurNewPassword() {
        if (this.state.passwordHintError) {
            return;
        }
        if (this.props.password && !this.isValidPassword()) {
            this.setState({passwordHintError: true});
        }
    }

    onBlurConfirmPassword() {
        if (this.state.shouldShowPasswordConfirmError) {
            return;
        }
        if (this.state.confirmNewPassword && !this.doPasswordsMatch()) {
            this.setState({shouldShowPasswordConfirmError: true});
        }
    }

    isValidPassword() {
        return this.props.password.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    doPasswordsMatch() {
        return this.props.password === this.state.confirmNewPassword;
    }

    isValidForm() {
        return this.isValidPassword() && this.doPasswordsMatch();
    }

    showPasswordMatchError() {
        return (
            !this.doPasswordsMatch()
            && this.state.shouldShowPasswordConfirmError
            && this.state.confirmNewPassword
        );
    }

    render() {
        let passwordHintStyle;
        if (this.state.passwordHintError && this.props.password && !this.isValidPassword()) {
            passwordHintStyle = styles.formError;
        }
        if (this.isValidPassword()) {
            passwordHintStyle = styles.formSuccess;
        }

        return (
            <>
                <View style={styles.mb6}>
                    <Text style={[styles.mb1, styles.formLabel]}>
                        {`${this.props.translate('setPasswordPage.enterPassword')}`}
                    </Text>
                    <TextInput
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        style={styles.textInput}
                        value={this.state.password}
                        onChangeText={password => this.props.updatePassword(password)}
                        onBlur={() => this.onBlurNewPassword()}
                    />
                    <Text style={[styles.formHint, styles.mt1, passwordHintStyle]}>
                        {this.props.translate('setPasswordPage.newPasswordPrompt')}
                    </Text>
                </View>
                <View style={styles.mb6}>
                    <Text style={[styles.mb1, styles.formLabel]}>
                        {`${this.props.translate('setPasswordPage.confirmNewPassword')}*`}
                    </Text>
                    <TextInput
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        style={styles.textInput}
                        value={this.state.confirmNewPassword}
                        onChangeText={confirmNewPassword => this.setState({confirmNewPassword})}
                        onSubmitEditing={() => this.props.onSubmitEditing()}
                        onBlur={() => this.onBlurConfirmPassword()}
                    />
                    {this.showPasswordMatchError() && (
                    <Text style={[styles.formError, styles.mt1]}>
                        {this.props.translate('setPasswordPage.passwordsDontMatch')}
                    </Text>
                    )}
                </View>
            </>
        );
    }
}

NewPasswordForm.propTypes = propTypes;

export default withLocalize(NewPasswordForm);
