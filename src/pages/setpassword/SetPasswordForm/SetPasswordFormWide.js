import React from 'react';
import {
    Text, TextInput, View,
} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import styles from '../../../styles/styles';
import ButtonWithLoader from '../../../components/ButtonWithLoader';
import {setPassword} from '../../../libs/actions/Session';
import ONYXKEYS from '../../../ONYXKEYS';
import SetPasswordPageProps from '../SetPasswordPageProps';

class SetPasswordFormWide extends React.Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);

        this.state = {
            password: '',
            formError: null,
        };
    }

    /**
     * Validate the form and then submit it
     */
    submitForm() {
        if (!this.state.password.trim()) {
            this.setState({
                formError: 'Password cannot be blank',
            });
            return;
        }

        this.setState({
            formError: null,
        });
        setPassword(this.state.password, lodashGet(this.props.route, 'params.validateCode', ''));
    }

    render() {
        return (
            <View style={[styles.loginFormContainer]}>
                <View style={[styles.mb4]}>
                    <Text style={[styles.formLabel]}>Enter a password:</Text>
                    <TextInput
                        style={[styles.textInput]}
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        value={this.state.password}
                        onChangeText={text => this.setState({password: text})}
                        onSubmitEditing={this.submitForm}
                        autoFocus
                    />
                </View>
                <ButtonWithLoader
                    text="Set Password"
                    onClick={this.submitForm}
                    isLoading={this.props.account.loading}
                />
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
            </View>
        );
    }
}

SetPasswordFormWide.propTypes = SetPasswordPageProps.propTypes;
SetPasswordFormWide.defaultProps = SetPasswordPageProps.defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(SetPasswordFormWide);
