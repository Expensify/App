import React from 'react';
import {
    Image, Text, TextInput, View, ScrollView
} from 'react-native';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import SubmitButton from '../SubmitButton';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import {fetchAccountDetails} from '../../../libs/actions/Session';
import welcomeScreenshot from '../../../../assets/images/welcome-screenshot.png';

class LoginFormNarrow extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            login: '',
            isLoading: false,
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.login.trim()) {
            this.setState({formError: 'Please enter an email or phone number'});
            return;
        }

        this.setState({
            formError: null,
            isLoading: true,
        });

        // Check if this login has an account associated with it or not
        fetchAccountDetails(this.state.login);
    }

    render() {
        return (
            <View style={[styles.loginFormContainer]}>
                <View style={[styles.mb4]}>
                    <Text style={[styles.formLabel]}>Sign up for the waitlist</Text>
                    <TextInput
                        style={[styles.textInput]}
                        value={this.state.login}
                        autoCompleteType="email"
                        textContentType="username"
                        onChangeText={text => this.setState({login: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                        placeholder="Email or phone"
                        placeholderTextColor={themeColors.textSupporting}
                    />
                </View>
                <View>
                    <SubmitButton
                        text="Continue"
                        isLoading={this.state.isLoading}
                        onClick={this.validateAndSubmitForm}
                        showRestartButton={false}
                    />
                </View>

                {this.state.formError && (
                    <Text style={[styles.formError]}>
                        {this.state.formError}
                    </Text>
                )}

                <View style={[styles.mt5, styles.mb5]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.signinWelcomeScreenshot]}
                        source={welcomeScreenshot}
                    />
                </View>

                <View style={[styles.mb6]}>
                    <Text style={[styles.textLabel]}>
                        With Expensify.cash, chat and payments are the same thing. Launching Summer 2021,
                        {' '}
                        join the waitlist to be first in line!
                    </Text>
                </View>

                <View>
                    <Text style={[styles.textLabel, styles.textStrong, styles.mb1]}>
                        Attention Open Source Developers:
                    </Text>
                    <Text style={[styles.textLabel]}>
                        Enter your Github handle to skip the wait and join our dev-only beta; help build
                        {' '}
                        tomorrow and
                        {' '}
                        <Text
                            style={[styles.link, styles.mx1]}
                            onPress={() => openURLInNewTab('https://github.com/Expensify/Expensify.cash')}
                        >
                            earn cash
                        </Text>
                        {' '}
                        today!
                    </Text>
                </View>
            </View>
        );
    }
}

export default LoginFormNarrow;
