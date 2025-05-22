import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import {LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PickerStateProvider} from 'react-native-picker-select';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import '../wdyr';
import ActiveElementRoleProvider from './components/ActiveElementRoleProvider';
import ColorSchemeWrapper from './components/ColorSchemeWrapper';
import ComposeProviders from './components/ComposeProviders';
import CustomStatusBarAndBackground from './components/CustomStatusBarAndBackground';
import CustomStatusBarAndBackgroundContextProvider from './components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContextProvider';
import ErrorBoundary from './components/ErrorBoundary';
import FullScreenBlockingViewContextProvider from './components/FullScreenBlockingViewContextProvider';
import FullScreenLoaderContextProvider from './components/FullScreenLoaderContext';
import HTMLEngineProvider from './components/HTMLEngineProvider';
import InitialURLContextProvider from './components/InitialURLContextProvider';
import {InputBlurContextProvider} from './components/InputBlurContext';
import KeyboardProvider from './components/KeyboardProvider';
import {LocaleContextProvider} from './components/LocaleContextProvider';
import NavigationBar from './components/NavigationBar';
import OnyxProvider from './components/OnyxProvider';
import PopoverContextProvider from './components/PopoverProvider';
import {ProductTrainingContextProvider} from './components/ProductTrainingContext';
import SafeArea from './components/SafeArea';
import ScrollOffsetContextProvider from './components/ScrollOffsetContextProvider';
import {SearchRouterContextProvider} from './components/Search/SearchRouter/SearchRouterContext';
import ThemeIllustrationsProvider from './components/ThemeIllustrationsProvider';
import ThemeProvider from './components/ThemeProvider';
import ThemeStylesProvider from './components/ThemeStylesProvider';
import {FullScreenContextProvider} from './components/VideoPlayerContexts/FullScreenContext';
import {PlaybackContextProvider} from './components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from './components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from './components/VideoPlayerContexts/VolumeContext';
import {EnvironmentProvider} from './components/withEnvironment';
import {KeyboardStateProvider} from './components/withKeyboardState';
import CONFIG from './CONFIG';
import Expensify from './Expensify';
import {CurrentReportIDContextProvider} from './hooks/useCurrentReportID';
import useDefaultDragAndDrop from './hooks/useDefaultDragAndDrop';
import OnyxUpdateManager from './libs/actions/OnyxUpdateManager';
import {ReportAttachmentsProvider} from './pages/home/report/ReportAttachmentsContext';
import type {Route} from './ROUTES';
import './setup/backgroundTask';
import {SplashScreenStateContextProvider} from './SplashScreenStateContext';

/**
 * Properties passed to the top-level React Native component by HybridApp.
 * These will always be `undefined` in "pure" NewDot builds.
 */
type AppProps = {
    /** The URL specifying the initial navigation destination when the app opens */
    url?: Route;
    /** Serialized configuration data required to initialize the React Native app (e.g. authentication details) */
    hybridAppSettings?: string;
    /** A timestamp indicating when the initial properties were last updated, used to detect changes */
    timestamp?: string;
};

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
    // We are not using expo-const, so ignore the warning.
    'No native ExponentConstants module found',
]);

const fill = {flex: 1};

const StrictModeWrapper = CONFIG.USE_REACT_STRICT_MODE_IN_DEV ? React.StrictMode : ({children}: {children: React.ReactElement}) => children;

function App({url, hybridAppSettings, timestamp}: AppProps) {
    useDefaultDragAndDrop();
    OnyxUpdateManager();

    return (
        <StrictModeWrapper>
            <SplashScreenStateContextProvider>
                <InitialURLContextProvider
                    url={url}
                    hybridAppSettings={hybridAppSettings}
                    timestamp={timestamp}
                >
                    <GestureHandlerRootView style={fill}>
                        <ComposeProviders
                            components={[
                                OnyxProvider,
                                ThemeProvider,
                                ThemeStylesProvider,
                                ThemeIllustrationsProvider,
                                SafeAreaProvider,
                                PortalProvider,
                                SafeArea,
                                LocaleContextProvider,
                                HTMLEngineProvider,
                                PopoverContextProvider,
                                CurrentReportIDContextProvider,
                                ScrollOffsetContextProvider,
                                ReportAttachmentsProvider,
                                PickerStateProvider,
                                EnvironmentProvider,
                                CustomStatusBarAndBackgroundContextProvider,
                                ActiveElementRoleProvider,
                                PlaybackContextProvider,
                                FullScreenContextProvider,
                                VolumeContextProvider,
                                VideoPopoverMenuContextProvider,
                                KeyboardProvider,
                                KeyboardStateProvider,
                                SearchRouterContextProvider,
                                ProductTrainingContextProvider,
                                InputBlurContextProvider,
                                FullScreenBlockingViewContextProvider,
                                FullScreenLoaderContextProvider,
                            ]}
                        >
                            <CustomStatusBarAndBackground />
                            <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                                <ColorSchemeWrapper>
                                    <Expensify />
                                </ColorSchemeWrapper>
                            </ErrorBoundary>
                            <NavigationBar />
                        </ComposeProviders>
                    </GestureHandlerRootView>
                </InitialURLContextProvider>
            </SplashScreenStateContextProvider>
        </StrictModeWrapper>
    );
}

App.displayName = 'App';

export default App;

export type {AppProps};
