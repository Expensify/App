import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './components/CustomStatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import Expensify from './Expensify';

const App = () => (
    <SafeAreaProvider>
        <CustomStatusBar />
        <ErrorBoundary errorMessage="E.cash crash caught by error boundary">
            <Expensify />
        </ErrorBoundary>
    </SafeAreaProvider>
);

App.displayName = 'App';

export default App;
