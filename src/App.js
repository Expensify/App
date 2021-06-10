import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import CustomStatusBar from './components/CustomStatusBar';
import Expensify from './Expensify';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
    <SafeAreaProvider>
        <CustomStatusBar />
        <ErrorBoundary errorMessage="[App] A Crash was intercepted by the main error boundary">
            <Expensify />
        </ErrorBoundary>
    </SafeAreaProvider>
);

App.displayName = 'App';

export default App;
