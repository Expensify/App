import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Image,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../lib/compose';
import {withRouter} from '../lib/Router';
import {signIn} from '../lib/actions/Session';
import IONKEYS from '../IONKEYS';
import withIon from '../components/withIon';
import styles from '../style/StyleSheet';
import logo from '../../assets/images/expensify-logo_reversed.png';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Ion Props */

    // Error to display when there is a session error returned
    error: PropTypes.string,
};

const defaultProps = {
    error: null,
};

class App extends Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);

        this.state = {
            login: '',
            password: '',
            twoFactorAuthCode: '',
        };
    }

    componentDidMount() {
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setTranslucent(true);
    }

    /**
     * Sign into the application when the form is submitted
     */
    submitForm() {
        signIn(this.state.login, this.state.password, this.state.twoFactorAuthCode, this.props.match.params.exitTo);
    }

    render() {
        return (
            <>
                <StatusBar />
                <SafeAreaView style={[styles.signInPage]}>
                    <View style={[styles.signInPageInner]}>
                        <View style={[styles.signInPageLogo]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinLogo]}
                                source={logo}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel, styles.colorReversed]}>Login</Text>
                            <TextInput
                                style={[styles.textInput, styles.textInputReversed]}
                                value={this.state.login}
                                autoCompleteType="email"
                                textContentType="username"
                                onChangeText={text => this.setState({login: text})}
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel, styles.colorReversed]}>Password</Text>
                            <TextInput
                                style={[styles.textInput, styles.textInputReversed]}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.password}
                                onChangeText={text => this.setState({password: text})}
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel, styles.colorReversed]}>Two Factor Code</Text>
                            <TextInput
                                style={[styles.textInput, styles.textInputReversed]}
                                value={this.state.twoFactorAuthCode}
                                placeholder="Required when 2FA is enabled"
                                placeholderTextColor="#C6C9CA"
                                onChangeText={text => this.setState({twoFactorAuthCode: text})}
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                        <View>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess, styles.mb4]}
                                onPress={this.submitForm}
                                underlayColor="#fff"
                            >
                                <Text style={[styles.buttonText, styles.buttonSuccessText]}>Log In</Text>
                            </TouchableOpacity>
                            {this.props.error && (
                                <Text style={[styles.formError]}>
                                    {this.props.error}
                                </Text>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </>
        );
    }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        // Bind this.props.error to the error in the session object
        error: {key: IONKEYS.SESSION, path: 'error', defaultValue: null},
    })
)(App);
