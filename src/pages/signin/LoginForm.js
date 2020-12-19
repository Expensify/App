import React from 'react';
import {Text, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    // A function that is called when the form is submitted
    onSubmit: PropTypes.function.isRequired,
};

class LoginForm extends React.Component {
    constructor() {
        super();
        this.state = {
            login: '',
        };
    }

    render() {
        return (
            <View style={[styles.mb4]}>
                <Text style={[styles.formLabel]}>Login</Text>
                <TextInput
                    style={[styles.textInput]}
                    value={this.state.login}
                    autoCompleteType="email"
                    textContentType="username"
                    onChangeText={text => this.setState({login: text})}
                    onSubmitEditing={this.props.submitForm}
                    autoCapitalize="none"
                    placeholder="Email or phone"
                />
            </View>
        );
    }
}

LoginForm.propTypes = propTypes;

export default LoginForm;
