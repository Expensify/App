import React from 'react';
import {
    Image, Text, TextInput, View, ScrollView
} from 'react-native';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import {fetchAccountDetails} from '../../libs/actions/Session';
import welcomeScreenshot from '../../../assets/images/welcome-screenshot.png';

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
        fetchAccountDetails(this.state.login);
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

                <ScrollView style={[styles.welcomeMessageScrollContainer]}>
                    <View>
                        <View style={[styles.mt5, styles.mb4, styles.alignItemsCenter]}>
                            <Text style={[styles.h3]}>
                                Welcome to the Expensify.cash beta
                            </Text>
                        </View>

                        <View>
                            <Text style={[styles.textP]}>
                                Join the waitlist now to be first in line to experience the next-generation of
                                {' '}
                                financial collaboration.
                            </Text>
                        </View>

                        <View style={[styles.mt4, styles.mb4]}>
                            <Text style={[styles.textP]}>
                                Know how to code? Enter your GitHub handle after signup to join our open-source
                                {' '}
                                community and earn cash for code!
                            </Text>
                        </View>

                        <View>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinWelcomeScreenshot]}
                                source={welcomeScreenshot}
                            />
                        </View>
                    </View>
                </ScrollView>
            </>
        );
    }
}

export default LoginForm;
