import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {fetchAccountDetails} from '../../../libs/actions/Session';
import styles from '../../../styles/styles';
import SubmitButton from '../SubmitButton';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import CONST from '../../../CONST';

class LoginFormWide extends React.Component {
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
            <>
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
                            autoFocus
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
                </View>

                <View style={[styles.mt6]}>
                    <View style={[styles.mb6]}>
                        <Text style={[styles.textP]}>
                            With Expensify.cash, chat and payments are the same thing. Launching Summer 2021,
                            {' '}
                            join the waitlist to be first in line!
                        </Text>
                    </View>

                    <View style={[styles.mb6]}>
                        <Text style={[styles.textP, styles.textStrong, styles.mb1]}>
                            Attention Open Source Developers:
                        </Text>
                        <Text style={[styles.textP]}>
                            Enter your Github handle on the next page to skip the wait and join our dev-only beta;
                            {' '}
                            help build tomorrow and
                            {' '}
                            <Text
                                style={[styles.link, styles.mx1]}
                                onPress={() => openURLInNewTab(CONST.UPWORK_URL)}
                            >
                                earn cash
                            </Text>
                            {' '}
                            today!
                        </Text>
                    </View>
                </View>
            </>
        );
    }
}

export default LoginFormWide;
