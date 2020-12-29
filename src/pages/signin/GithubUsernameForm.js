import React from 'react';
import {
    Text, TextInput, View
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import {setGitHubUsername} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';

const propTypes = {
    /* Onyx Props */

    // The session of the logged in person
    session: PropTypes.shape({
        // Whether or not a sign on form is loading (being submitted)
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    session: {},
};

class GithubUsernameForm extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            githubUsername: '',
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.githubUsername.trim()) {
            this.setState({formError: 'Please enter your GitHub username'});
            return;
        }

        this.setState({
            formError: null,
        });

        // Save the github username to their account
        setGitHubUsername(this.state.githubUsername);
    }

    render() {
        return (
            <>
                <View style={[styles.loginFormContainer]}>
                    <View style={[styles.mb4]}>
                        <Text style={[styles.formLabel]}>GitHub Username</Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.state.githubUsername}
                            textContentType="username"
                            onChangeText={text => this.setState({githubUsername: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            autoCapitalize="none"
                            autoFocus
                        />
                    </View>
                    <View>
                        <SubmitButton
                            text="Next"
                            isLoading={this.props.session.isLoading}
                            onClick={this.validateAndSubmitForm}
                        />
                        <ChangeExpensifyLoginLink />
                    </View>
                    {this.state.formError && (
                        <Text style={[styles.formError]}>
                            {this.state.formError}
                        </Text>
                    )}
                </View>

                <View style={[styles.mt4, styles.mb4]}>
                    <Text style={[styles.textP, styles.textStrong]}>
                        You&apos;re on the waitlist!
                    </Text>
                    <Text style={[styles.textP]}>
                        Thanks for adding yourself to the waitlist. If you&apos;re a developer, just enter your
                        {' '}
                        GitHub username, and we&apos;ll grant you instant access to the dev-only beta. Otherwise,
                        {' '}
                        you&apos;re all set -- we&apos;ll let you know when to check back.
                    </Text>
                </View>
            </>
        );
    }
}

GithubUsernameForm.propTypes = propTypes;
GithubUsernameForm.defaultProps = defaultProps;

export default withOnyx({
    session: {key: ONYXKEYS.SESSION},
})(GithubUsernameForm);
