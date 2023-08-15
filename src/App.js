import '../wdyr';
import React from 'react';
import {LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Onyx from 'react-native-onyx';
import {PortalProvider} from '@gorhom/portal';
import {PickerStateProvider} from 'react-native-picker-select';
import CustomStatusBar from './components/CustomStatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import Expensify from './Expensify';
import {LocaleContextProvider} from './components/withLocalize';
import OnyxProvider from './components/OnyxProvider';
import HTMLEngineProvider from './components/HTMLEngineProvider';
import PopoverContextProvider from './components/PopoverProvider';
import ComposeProviders from './components/ComposeProviders';
import SafeArea from './components/SafeArea';
import * as Environment from './libs/Environment/Environment';
import {WindowDimensionsProvider} from './components/withWindowDimensions';
import {KeyboardStateProvider} from './components/withKeyboardState';
import ThemeProvider from './styles/themes/ThemeProvider';
import ThemeStylesProvider from './styles/ThemeStylesProvider';
import {CurrentReportIDContextProvider} from './components/withCurrentReportID';
import {EnvironmentProvider} from './components/withEnvironment';
import * as Session from './libs/actions/Session';
import useDefaultDragAndDrop from './hooks/useDefaultDragAndDrop';

// For easier debugging and development, when we are in web we expose Onyx to the window, so you can more easily set data into Onyx
if (window && Environment.isDevelopment()) {
    window.Onyx = Onyx;
    window.setSupportToken = Session.setSupportAuthToken;
}

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
]);

const fill = {flex: 1};

function App() {
    useDefaultDragAndDrop();
    return (
        <GestureHandlerRootView style={fill}>
            <ComposeProviders
                components={[
                    OnyxProvider,
                    SafeAreaProvider,
                    PortalProvider,
                    SafeArea,
                    LocaleContextProvider,
                    HTMLEngineProvider,
                    WindowDimensionsProvider,
                    KeyboardStateProvider,
                    PopoverContextProvider,
                    CurrentReportIDContextProvider,
                    PickerStateProvider,
                    EnvironmentProvider,
                    ThemeProvider,
                    ThemeStylesProvider,
                ]}
            >
                <CustomStatusBar />
                <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                    <Expensify />
                </ErrorBoundary>
            </ComposeProviders>
        </GestureHandlerRootView>
    );
}

App.displayName = 'App';

export default App;
