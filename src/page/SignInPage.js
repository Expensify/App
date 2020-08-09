import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    StatusBar,
    Button,
    TextInput,
    View,
} from 'react-native';
import * as Store from '../store/Store';
import {signIn} from '../store/actions/SessionActions';
import STOREKEYS from '../store/STOREKEYS';
import WithStoreSubscribeToState from '../components/WithStoreSubscribeToState';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
        };
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
                        />
                    </View>
                    <View>
                        <Text>Password:</Text>
                        <TextInput
                            style={{height: 40, borderColor: 'black', borderWidth: 2}}
                            secureTextEntry
                            value={this.state.password}
                            onChangeText={text => this.setState({password: text})}
                        />
                    </View>
                    <View>
                        <Button
                            title="Log In"
                            onPress={() => signIn(this.state.login, this.state.password, true)}
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

export default WithStoreSubscribeToState({
    // Bind this.state.error to the error in the session object
    error: {key: STOREKEYS.SESSION, path: 'error', defaultValue: null},
})(App);
