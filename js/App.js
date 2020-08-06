/**
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {SafeAreaView, Text, StatusBar} from 'react-native';
import {Button, TextInput, View} from 'react-native-web';
import * as Store from './store/Store.js';
import {signIn} from './store/actions/SessionActions.js';
import STOREKEYS from './store/STOREKEYS.js';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.submit = this.submit.bind(this);
    this.sessionChanged = this.sessionChanged.bind(this);

    this.state = {
      login: '',
      password: '',
      error: Store.get(STOREKEYS.SESSION, 'error'),
    };
  }

  componentDidMount() {
    // Listen for changes to our session
    Store.subscribe(STOREKEYS.SESSION, this.sessionChanged);
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
    signIn(this.state.login, this.state.password);
  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <View>
            <Text>Login:</Text>
            <TextInput
              value={this.state.login}
              onChange={(e) => this.setState({login: e.target.value})}
            />
          </View>
          <View>
            <Text>Password:</Text>
            <TextInput
              value={this.state.password}
              onChange={(e) => this.setState({password: e.target.value})}
            />
          </View>
          <View>
            <Button onPress={this.submit}>Log In</Button>
          </View>
        </SafeAreaView>
      </>
    );
  }
}
