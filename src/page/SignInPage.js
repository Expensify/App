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
import {signIn} from '../lib/actions/ActionsSession';
import IONKEYS from '../IONKEYS';
import WithIon from '../components/WithIon';
import styles from '../style/StyleSheet';
import logo from '../images/expensify-logo_reversed.png';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
            twoFactorAuthCode: '',
        };
    }

    submitLogin() {
        signIn(this.state.login, this.state.password,
            this.state.twoFactorAuthCode, true);
    }

    render() {
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={[styles.signInPage]}>
                    <View style={[styles.signInPageInner]}>
                        <View style={[styles.signInPageLogo]}>
                            <Image
                                style={[styles.sidebarHeaderLogo]}
                                source={logo}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel, styles.colorReversed]}>Login</Text>
                            <TextInput
                                style={[styles.textInput, styles.textInputReversed]}
                                value={this.state.login}
                                onChangeText={text => this.setState({login: text})}
                                onSubmitEditing={() => this.submitLogin()}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel, styles.colorReversed]}>Password</Text>
                            <TextInput
                                style={[styles.textInput, styles.textInputReversed]}
                                secureTextEntry
                                value={this.state.password}
                                onChangeText={text => this.setState({password: text})}
                                onSubmitEditing={() => this.submitLogin()}
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
                                onSubmitEditing={() => this.submitLogin()}
                            />
                        </View>
                        <View>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonSuccess]}
                                onPress={() => this.submitLogin()}
                                underlayColor='#fff'>
                                <Text style={[styles.buttonText, styles.buttonSuccessText]}>Log In</Text>
                            </TouchableOpacity>
                            {this.state.error && (
                                <Text style={{color: 'red'}}>
                                    {this.state.error}
                                </Text>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </>
        );
    }
}

export default WithIon({
    // Bind this.state.error to the error in the session object
    error: {key: IONKEYS.SESSION, path: 'error', defaultValue: null},
})(App);
