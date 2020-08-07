/**
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {SafeAreaView, Text, StatusBar, View, Button} from 'react-native';
import {signOut} from '../../store/actions/SessionActions';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.signOut = this.signOut.bind(this);
  }

  async signOut() {
    await signOut();
  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <View>
            <Text
              style={{
                fontSize: 20,
                margin: 20,
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              {'React Native Chat Homepage!'}
            </Text>
            <Button onPress={this.signOut} title={'Sign Out'} />
          </View>
        </SafeAreaView>
      </>
    );
  }
}
