import {Text, TextInput, View} from 'react-native';
import _ from 'underscore';
import React from 'react';
import lodashGet from 'lodash.get';
import styles from '../../styles/styles';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import {setPassword} from '../../libs/actions/Session';
import SetPasswordPageProps from './SetPasswordPageProps';

class SetPasswordForm extends React.Component {
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
            <>
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
            </>
        );
    }
}

SetPasswordForm.propTypes = SetPasswordPageProps.propTypes;
SetPasswordForm.defaultProps = SetPasswordPageProps.defaultProps;

export default SetPasswordForm;
