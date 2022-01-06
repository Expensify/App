import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../components/Text';
import withLocalize, {
    withLocalizePropTypes,
} from '../../components/withLocalize';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import TextInput from '../../components/TextInput';

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
            passwordHintError: false,
        };
    }

    componentDidUpdate(prevProps) {
        const passwordChanged = (this.props.password !== prevProps.password);
        if (passwordChanged) {
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

    isValidPassword() {
        return this.props.password.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
    }

    /**
     * checks if the password invalid
     * @returns {Boolean}
    */
    isInvalidPassword() {
        return this.state.passwordHintError && this.props.password && !this.isValidPassword();
    }

    isValidForm() {
        return this.isValidPassword();
    }


    render() {
        return (
            <View style={styles.mb6}>
                <TextInput
                    label={`${this.props.translate('setPasswordPage.enterPassword')}`}
                    secureTextEntry
                    autoCompleteType="password"
                    textContentType="password"
                    value={this.props.password}
                    onChangeText={password => this.props.updatePassword(password)}
                    onBlur={() => this.onBlurNewPassword()}
                    onSubmitEditing={() => this.props.onSubmitEditing()}
                />
                <Text
                    style={[
                        styles.formHelp,
                        styles.mt1,
                        this.isInvalidPassword() && styles.formError,
                    ]}
                >
                    {this.props.translate('setPasswordPage.newPasswordPrompt')}
                </Text>
            </View>
        );
    }
}

NewPasswordForm.propTypes = propTypes;

export default withLocalize(NewPasswordForm);
