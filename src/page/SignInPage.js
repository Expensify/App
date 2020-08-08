/**
 * @format
 * @flow strict-local
 */

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

export default class App extends Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.sessionChanged = this.sessionChanged.bind(this);

        this.state = {
            login: '',
            password: '',
            error: null,
        };
    }

    componentDidMount() {
        // Listen for changes to our session
        Store.subscribe(STOREKEYS.SESSION, this.sessionChanged);
        Store.get(STOREKEYS.SESSION, 'error').then(error => this.setState({error}));
    }

    componentWillUnmount() {
        Store.unsubscribe(STOREKEYS.SESSION, this.sessionChanged);
    }

    /**
     * When the session changes, change which page the user sees
     *
     * @param {object} newSession
     */
    sessionChanged(newSession) {
        this.setState({error: newSession && newSession.error});
    }

    /**
     * When the form is submitted, then we trigger our prop callback
     */
    submit() {
        signIn(this.state.login, this.state.password, true);
    }

    render() {
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                    <View>
                        <Text>Login:</Text>
                        <TextInput
                            style={{height: 40, borderColor: 'black', borderWidth: 2}}
                            value={this.state.login}
                            onChangeText={(text) => this.setState({login: text})}
                        />
                    </View>
                    <View>
                        <Text>Password:</Text>
                        <TextInput
                            style={{height: 40, borderColor: 'black', borderWidth: 2}}
                            secureTextEntry={true}
                            value={this.state.password}
                            onChangeText={(text) => this.setState({password: text})}
                        />
                    </View>
                    <View>
                        <Button onPress={this.submit} title={'Log In'} />
                    {this.state.error && <Text style={{color: 'red'}}>
                        {this.state.error}
                    </Text>}
                    </View>
                </SafeAreaView>
            </>
        );
    }
}
