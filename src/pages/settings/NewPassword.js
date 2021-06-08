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
    password: PropTypes.string.isRequired,
    setPassword: PropTypes.func.isRequired,
    passwordIsValid: PropTypes.func.isRequired,
    onSubmitEditing: PropTypes.func.isRequired,
    ...withLocalizePropTypes,
};

class NewPassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmNewPassword: '',
            passwordHintError: false,
            confirmPasswordError: false,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        const eitherPasswordChanged = this.props.password
        !== prevProps.password || this.state.confirmNewPassword !== prevState.confirmNewPassword;
        if (eitherPasswordChanged) {
            this.props.passwordIsValid(this.formIsValid());
        }
    }

    onBlurNewPassword() {
        if (this.state.passwordHintError) {
            return;
        }
        if (this.props.password && !this.meetsPasswordRules()) {
            this.setState({passwordHintError: true});
        }
    }

    onBlurConfirmPassword() {
        if (this.state.confirmPasswordError) {
            return;
        }
        if (this.state.confirmNewPassword && !this.passwordsMatch()) {
            this.setState({confirmPasswordError: true});
        }
    }

    meetsPasswordRules() {
        return this.props.password.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    passwordsMatch() {
        return this.props.password === this.state.confirmNewPassword;
    }

    formIsValid() {
        return this.meetsPasswordRules() && this.passwordsMatch();
    }

    showPasswordMatchError() {
        return (
            !this.passwordsMatch()
      && this.state.confirmPasswordError
      && this.state.confirmNewPassword
        );
    }

    render() {
        let passwordHintStyle;
        if (this.state.passwordHintError && this.props.password && !this.meetsPasswordRules()) {
            passwordHintStyle = styles.formError;
        }
        if (this.meetsPasswordRules()) {
            passwordHintStyle = styles.formSuccess;
        }

        return (
            <>
                <View style={styles.mb6}>
                    <Text style={[styles.mb1, styles.formLabel]}>
                        {`${this.props.translate('setPasswordPage.enterPassword')}*`}
                    </Text>
                    <TextInput
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        style={styles.textInput}
                        value={this.state.password}
                        onChangeText={password => this.props.setPassword(password)}
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

NewPassword.propTypes = propTypes;

export default withLocalize(NewPassword);
