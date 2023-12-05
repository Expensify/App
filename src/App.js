import {PortalProvider} from '@gorhom/portal';
import PropTypes from 'prop-types';
import React from 'react';
import {LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Onyx from 'react-native-onyx';
import {PickerStateProvider} from 'react-native-picker-select';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import '../wdyr';
import ColorSchemeWrapper from './components/ColorSchemeWrapper';
import ComposeProviders from './components/ComposeProviders';
import CustomStatusBar from './components/CustomStatusBar';
import CustomStatusBarContextProvider from './components/CustomStatusBar/CustomStatusBarContextProvider';
import ErrorBoundary from './components/ErrorBoundary';
import HTMLEngineProvider from './components/HTMLEngineProvider';
import {LocaleContextProvider} from './components/LocaleContextProvider';
import OnyxProvider from './components/OnyxProvider';
import PopoverContextProvider from './components/PopoverProvider';
import SafeArea from './components/SafeArea';
import {CurrentReportIDContextProvider} from './components/withCurrentReportID';
import {EnvironmentProvider} from './components/withEnvironment';
import {KeyboardStateProvider} from './components/withKeyboardState';
import {WindowDimensionsProvider} from './components/withWindowDimensions';
import Expensify from './Expensify';
import useDefaultDragAndDrop from './hooks/useDefaultDragAndDrop';
import InitialUrlContext from './InitialUrlContext';
import OnyxUpdateManager from './libs/actions/OnyxUpdateManager';
import * as Session from './libs/actions/Session';
import * as Environment from './libs/Environment/Environment';
import {ReportAttachmentsProvider} from './pages/home/report/ReportAttachmentsContext';
import ThemeIllustrationsProvider from './styles/illustrations/ThemeIllustrationsProvider';
import ThemeProvider from './styles/themes/ThemeProvider';
import ThemeStylesProvider from './styles/ThemeStylesProvider';

const propTypes = {
    /** If we have an authToken this is true */
    url: PropTypes.string,
};

const defaultProps = {
    url: null,
};

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

function App(props) {
    useDefaultDragAndDrop();
    OnyxUpdateManager();
    return (
        <InitialUrlContext.Provider value={props.url}>
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
                        ReportAttachmentsProvider,
                        PickerStateProvider,
                        EnvironmentProvider,
                        ThemeProvider,
                        ThemeStylesProvider,
                        ThemeIllustrationsProvider,
                        CustomStatusBarContextProvider,
                    ]}
                >
                    <CustomStatusBar />
                    <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                        <ColorSchemeWrapper>
                            <Expensify />
                        </ColorSchemeWrapper>
                    </ErrorBoundary>
                </ComposeProviders>
            </GestureHandlerRootView>
        </InitialUrlContext.Provider>
    );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;
App.displayName = 'App';

export default App;
