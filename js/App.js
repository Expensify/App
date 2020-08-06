/**
 * @format
 * @flow strict-local
 */

import React from 'react';
import {SafeAreaView, Text, StatusBar} from 'react-native';

const App: () => React$Node = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <Text style={{textAlign: 'center', fontSize: 36}}>Hello World!</Text>
      </SafeAreaView>
    </>
  );
};

export default App;
