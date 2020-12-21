import React from 'react';
import {Text, TextInput, View} from 'react-native';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import openURLInNewTab from '../../libs/openURLInNewTab';
import {hasAccount} from '../../libs/actions/Session';

class LoginForm extends React.Component {
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
        hasAccount(this.state.login);
    }

    render() {
        return (
            <>
                <View style={[styles.mb4]}>
                    <Text style={[styles.formLabel]}>Login</Text>
                    <TextInput
                        style={[styles.textInput]}
                        value={this.state.login}
                        autoCompleteType="email"
                        textContentType="username"
                        onChangeText={text => this.setState({login: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                        placeholder="Email or phone"
                    />
                </View>
                <View>
                    <SubmitButton
                        text="Next"
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

                <View style={[styles.hr]} />

                <View style={[styles.mt5]}>
                    <Text style={[styles.h3]}>
                        Welcome to the Expensify.cash beta
                    </Text>
                </View>

                <View style={[styles.mt4]}>
                    <Text style={[styles.textP]}>
                        Expensify.cash is the next generation of Expensify: a reimagination of payments based atop a
                        {' '}
                        foundation of chat. Best of all, it&apos;s fully open source!
                    </Text>
                </View>

                <View style={[styles.mt4]}>
                    <Text style={[styles.textP]}>
                        And yes you heard right -- there&apos;s cash involved! Check out
                        {' '}
                        <Text
                            style={[styles.link, styles.mx1]}
                            onPress={() => openURLInNewTab('https://testflight.apple.com/join/ucuXr4g5')}
                        >
                            the repository
                        </Text>
                        {' '}
                        for the current list of issues that are available to work on. We&apos;re making new issues
                        {' '}
                        every day, so be sure to check back, and feel free to file your own.
                    </Text>
                </View>
            </>
        );
    }
}

export default LoginForm;
