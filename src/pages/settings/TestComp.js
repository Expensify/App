import {withOnyx} from 'react-native-onyx';
import React from 'react';
import {TextInput, View} from 'react-native';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import withLocalize from '../../components/withLocalize';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';

class NewPassword extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newPassword: '',
            confirmNewPassword: '',
            focusIsOnNewPassword: false,
            focusIsOnConfirmNewPassword: false,
        };
    }

    render() {
        const meetsPasswordRules = this.state.newPassword.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING);
        const shouldShowPasswordHint = this.state.focusIsOnNewPassword || (this.state.newPassword.length > 0 && !meetsPasswordRules);
        const passwordsMatch = this.state.newPassword !== this.state.confirmNewPassword;


        return (
            <>
                <View style={styles.mb6}>
                    <Text style={[styles.mb1, styles.formLabel]}>
                        {`${this.props.translate('setPasswordPage.enterPassword')}*`}
                    </Text>
                    <TextInput
                        // secureTextEntry
                        autoCompleteType="password"
                        // textContentType="password"
                        style={styles.textInput}
                        value={this.state.newPassword}
                        onChangeText={newPassword => this.setState({newPassword})}
                        onFocus={() => this.setState({focusIsOnNewPassword: true})}
                        onBlur={() => this.setState({focusIsOnNewPassword: false})}
                    />
                    {shouldShowPasswordHint && (
                    <Text style={[styles.formHint, styles.mt1, meetsPasswordRules ? styles.textSuccess : styles.textError]}>
                        {this.props.translate('setPasswordPage.newPasswordPrompt')}
                    </Text>
                    )}
                </View>
                <View style={styles.mb6}>
                    <Text style={[styles.mb1, styles.formLabel]}>
                        {`${this.props.translate('setPasswordPage.confirmNewPassword')}*`}
                    </Text>
                    <TextInput
                        // secureTextEntry
                        autoCompleteType="password"
                        // textContentType="password"
                        style={styles.textInput}
                        value={this.state.confirmNewPassword}
                        onChangeText={confirmNewPassword => this.setState({confirmNewPassword})}
                        onSubmitEditing={this.handleChangePassword}
                        onFocus={() => this.setState({focusIsOnConfirmNewPassword: true})}
                        onBlur={() => this.setState({focusIsOnConfirmNewPassword: false})}
                    />
                    {(passwordsMatch && this.state.focusIsOnConfirmNewPassword) && (
                        <Text style={[styles.formHint, styles.mt1, styles.textError]}>
                            {this.props.translate('setPasswordPage.passwordsDontMatch')}
                        </Text>
                    )}
                </View>
            </>
        );
    }
}
export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(NewPassword);
