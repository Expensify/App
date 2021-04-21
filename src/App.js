import React from 'react';
import {LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './components/CustomStatusBar';
import Expensify from './Expensify';

LogBox.ignoreLogs([
    'Setting a timer',
]);

const App = () => (
    <SafeAreaProvider>
        <CustomStatusBar />
        <Expensify />
    </SafeAreaProvider>
);

App.displayName = 'App';

export default App;
