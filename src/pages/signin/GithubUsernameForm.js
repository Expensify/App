import React from 'react';
import {Text, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import Onyx from 'react-native-onyx';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    // A function that is called when the form is submitted
    onSubmit: PropTypes.func.isRequired,
};

class GithubUsernameForm extends React.Component {
    constructor() {
        super();

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            githubUsername: '',
            isLoading: false,
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.githubUsername.trim()) {
            this.setState({formError: 'Please fill out all fields'});
            return;
        }

        this.setState({
            formError: null,
            isLoading: true,
        });

        Onyx.merge(ONYXKEYS.CREDENTIALS, {
            githubUsername: this.state.githubUsername,
        });
    }

    render() {
        return (
            <>
                <View style={[styles.mb4]}>
                    <Text style={[styles.formLabel]}>GitHub Username</Text>
                    <TextInput
                        style={[styles.textInput]}
                        value={this.state.githubUsername}
                        autoCompleteType="email"
                        textContentType="username"
                        onChangeText={text => this.setState({githubUsername: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                    />
                </View>
                <View>
                    <SubmitButton
                        text="Next"
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

GithubUsernameForm.propTypes = propTypes;

export default GithubUsernameForm;
