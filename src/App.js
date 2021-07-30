import React from 'react';
import {LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './components/CustomStatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import Expensify from './Expensify';
import {LocaleContextProvider} from './components/withLocalize';

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',

    // Caused by rn-fetch-blob. Can safely ignore as it has no impact on features.
    'Require cycle: node_modules/rn-fetch-blob',
]);

const App = () => (
    <SafeAreaProvider>
        <LocaleContextProvider>
            <CustomStatusBar />
            <ErrorBoundary errorMessage="E.cash crash caught by error boundary">
                <Expensify />
            </ErrorBoundary>
        </LocaleContextProvider>
    </SafeAreaProvider>
);

App.displayName = 'App';

export default App;
