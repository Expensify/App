import '../wdyr';
import React from 'react';
import {LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Onyx from 'react-native-onyx';
import crashlytics from '@react-native-firebase/crashlytics';
import CustomStatusBar from './components/CustomStatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import Expensify from './Expensify';
import {LocaleContextProvider} from './components/withLocalize';
import OnyxProvider from './components/OnyxProvider';
import HTMLEngineProvider from './components/HTMLEngineProvider';
import ComposeProviders from './components/ComposeProviders';
import SafeArea from './components/SafeArea';
import * as Environment from './libs/Environment/Environment';
import {WindowDimensionsProvider} from './components/withWindowDimensions';
import CONFIG from './CONFIG';

// We do not want to send crash reports if we are on a locally built release version of the app.
// Crashlytics is disabled by default for debug builds, but not local release builds so we are using
// an environment variable to enable them in the staging & production apps and opt-out everywhere else.
if (!CONFIG.SEND_CRASH_REPORTS) {
    crashlytics().then(config => config.setCrashlyticsCollectionEnabled(false));
}

// For easier debugging and development, when we are in web we expose Onyx to the window, so you can more easily set data into Onyx
if (window && Environment.isDevelopment()) {
    window.Onyx = Onyx;
}

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
]);

const fill = {flex: 1};

const App = () => (
    <GestureHandlerRootView style={fill}>
        <ComposeProviders
            components={[
                OnyxProvider,
                SafeAreaProvider,
                SafeArea,
                LocaleContextProvider,
                HTMLEngineProvider,
                WindowDimensionsProvider,
            ]}
        >
            <CustomStatusBar />
            <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                <Expensify />
            </ErrorBoundary>
        </ComposeProviders>
    </GestureHandlerRootView>
);

App.displayName = 'App';

export default App;
