import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    StatusBar,
    Button,
    TextInput,
    View,
} from 'react-native';
import {signIn} from '../lib/actions/ActionsSession';
import IONKEYS from '../store/IONKEYS';
import WithIon from '../components/WithIon';

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
                <SafeAreaView style={{padding: 20}}>
                    <View>
                        <Text>Login:</Text>
                        <TextInput
                            style={{height: 40, borderColor: 'black', borderWidth: 2}}
                            value={this.state.login}
                            onChangeText={text => this.setState({login: text})}
                            onSubmitEditing={() => this.submitLogin()}
                        />
                    </View>
                    <View>
                        <Text>Password:</Text>
                        <TextInput
                            style={{height: 40, borderColor: 'black', borderWidth: 2}}
                            secureTextEntry
                            value={this.state.password}
                            onChangeText={text => this.setState({password: text})}
                            onSubmitEditing={() => this.submitLogin()}
                        />
                    </View>
                    <View>
                        <Text>Two Factor Code:</Text>
                        <TextInput
                            style={{height: 40, borderColor: 'black', borderWidth: 2}}
                            value={this.state.twoFactorAuthCode}
                            placeholder="Required when 2FA is enabled"
                            onChangeText={text => this.setState({twoFactorAuthCode: text})}
                            onSubmitEditing={() => this.submitLogin()}
                        />
                    </View>
                    <View>
                        <Button
                            title="Log In"
                            onPress={() => this.submitLogin()}
                        />
                        {this.state.error && (
                            <Text style={{color: 'red'}}>
                                {this.state.error}
                            </Text>
                        )}
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
