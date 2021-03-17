import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {fetchAccountDetails} from '../../../libs/actions/Session';
import styles from '../../../styles/styles';
import ButtonWithLoader from '../../../components/ButtonWithLoader';
import ONYXKEYS from '../../../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // An error message to display to the user
        error: PropTypes.string,

        // Whether or not a sign on form is loading (being submitted)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {},
};

class LoginFormWide extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            login: '',
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
        });

        // Check if this login has an account associated with it or not
        fetchAccountDetails(this.state.login);
    }

    render() {
        return (
            <>
                <View style={[styles.loginFormContainer]}>
                    <View style={[styles.mb4]}>
                        <Text style={[styles.formLabel]}>Enter your phone or email:</Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.state.login}
                            autoCompleteType="email"
                            textContentType="username"
                            onChangeText={text => this.setState({login: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            autoCapitalize="none"
                            placeholder="Phone or Email"
                            autoFocus
                        />
                    </View>
                    <View>
                        <ButtonWithLoader
                            text="Continue"
                            isLoading={this.props.account.loading}
                            onClick={this.validateAndSubmitForm}
                        />
                    </View>

                    {this.state.formError && (
                        <Text style={[styles.formError]}>
                            {this.state.formError}
                        </Text>
                    )}

                    {!_.isEmpty(this.props.account.error) && (
                        <Text style={[styles.formError]}>
                            {this.props.account.error}
                        </Text>
                    )}
                </View>

                <View style={[styles.mt6]}>
                    <View style={[styles.mb6]}>
                        <Text style={[styles.textP, styles.textStrong, styles.mb1]}>
                            With Expensify.cash, chat and payments are the same thing.
                        </Text>
                        <Text style={[styles.textP]}>
                            Money talks. And now that chat and payments are in one place, it&apos;s also easy.
                            {' '}
                            Your payments get to you as fast as you can get your point across.
                        </Text>
                    </View>
                </View>
            </>
        );
    }
}

LoginFormWide.propTypes = propTypes;
LoginFormWide.defaultProps = defaultProps;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(LoginFormWide);
