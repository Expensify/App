import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './components/CustomStatusBar';
import Expensify from './Expensify';

const App = () => (
    <SafeAreaProvider>
        <CustomStatusBar />
        <Expensify />
    </SafeAreaProvider>
);

App.displayName = 'App';

export default App;
