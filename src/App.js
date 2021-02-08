import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Expensify from './Expensify';

const App = () => (
    <SafeAreaProvider>
        <Expensify />
    </SafeAreaProvider>
);

App.displayName = 'App';

export default App;
