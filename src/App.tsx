import {PortalProvider} from '@gorhom/portal';
import * as Sentry from '@sentry/react-native';
import {maybeCompleteAuthSession} from 'expo-web-browser';
import React from 'react';
import {LogBox, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PickerStateProvider} from 'react-native-picker-select';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import '../wdyr';
import {ActionSheetAwareScrollViewProvider} from './components/ActionSheetAwareScrollView';
import ActiveElementRoleProvider from './components/ActiveElementRoleProvider';
import ColorSchemeWrapper from './components/ColorSchemeWrapper';
import ComposeProviders from './components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from './components/CurrentUserPersonalDetailsProvider';
import CustomStatusBarAndBackground from './components/CustomStatusBarAndBackground';
import CustomStatusBarAndBackgroundContextProvider from './components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContextProvider';
import EnvironmentProvider from './components/EnvironmentContextProvider';
import ErrorBoundary from './components/ErrorBoundary';
import FullScreenBlockingViewContextProvider from './components/FullScreenBlockingViewContextProvider';
import FullScreenLoaderContextProvider from './components/FullScreenLoaderContext';
import HTMLEngineProvider from './components/HTMLEngineProvider';
import InitialURLContextProvider from './components/InitialURLContextProvider';
import {InputBlurContextProvider} from './components/InputBlurContext';
import KeyboardProvider from './components/KeyboardProvider';
import {LocaleContextProvider} from './components/LocaleContextProvider';
import {ModalProvider} from './components/Modal/Global/ModalContext';
import NavigationBar from './components/NavigationBar';
import OnyxListItemProvider from './components/OnyxListItemProvider';
import PopoverContextProvider from './components/PopoverProvider';
import SafeArea from './components/SafeArea';
import ScrollOffsetContextProvider from './components/ScrollOffsetContextProvider';
import SidePanelContextProvider from './components/SidePanel/SidePanelContextProvider';
import SVGDefinitionsProvider from './components/SVGDefinitionsProvider';
import {EditingCellProvider} from './components/Table/EditableCell';
import ThemeIllustrationsProvider from './components/ThemeIllustrationsProvider';
import ThemeProvider from './components/ThemeProvider';
import ThemeStylesProvider from './components/ThemeStylesContextProvider';
import {KeyboardStateProvider} from './components/withKeyboardState';
import CONFIG from './CONFIG';
import CONST from './CONST';
import Expensify from './Expensify';
import {CurrentReportIDContextProvider} from './hooks/useCurrentReportID';
import useDefaultDragAndDrop from './hooks/useDefaultDragAndDrop';
import HybridAppHandler from './HybridAppHandler';
import OnyxUpdateManager from './libs/actions/OnyxUpdateManager';
import './libs/HybridApp';
import './setup/backgroundLocationTrackingTask';
import './setup/backgroundTask';
import './setup/fraudProtection';
import './setup/hybridApp';
import {SplashScreenStateContextProvider} from './SplashScreenStateContext';

// This is needed to close pop-up window during logout for users logged in via SSO
maybeCompleteAuthSession();

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
]);

const fill = {flex: 1};

const StrictModeWrapper = CONFIG.USE_REACT_STRICT_MODE_IN_DEV ? React.StrictMode : ({children}: {children: React.ReactElement}) => children;

function App() {
    useDefaultDragAndDrop();
    OnyxUpdateManager();

    return (
        <StrictModeWrapper>
            <SplashScreenStateContextProvider>
                <InitialURLContextProvider>
                    <HybridAppHandler />

                    <GestureHandlerRootView style={fill}>
                        {/* Initialize metrics early to ensure the UI renders even when NewDot is hidden.
                            This is necessary for iOS HybridApp's SignInPage to appear correctly without the bootsplash.
                            See: https://github.com/Expensify/App/pull/65178#issuecomment-3139026551
                        */}
                        <SafeAreaProvider
                            initialMetrics={{
                                insets: {top: 0, right: 0, bottom: 0, left: 0},
                                frame: {x: 0, y: 0, width: 0, height: 0},
                            }}
                        >
                            <View
                                style={fill}
                                fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                            >
                                <ComposeProviders
                                    components={[
                                        OnyxListItemProvider,
                                        CurrentUserPersonalDetailsProvider,
                                        LocaleContextProvider,
                                        ThemeProvider,
                                        ThemeStylesProvider,
                                        ThemeIllustrationsProvider,
                                        SVGDefinitionsProvider,
                                        HTMLEngineProvider,
                                        PortalProvider,
                                        SafeArea,
                                        PopoverContextProvider,
                                        CurrentReportIDContextProvider,
                                        ScrollOffsetContextProvider,
                                        PickerStateProvider,
                                        EnvironmentProvider,
                                        CustomStatusBarAndBackgroundContextProvider,
                                        ActiveElementRoleProvider,
                                        ActionSheetAwareScrollViewProvider,
                                        KeyboardProvider,
                                        KeyboardStateProvider,
                                        InputBlurContextProvider,
                                        FullScreenBlockingViewContextProvider,
                                        FullScreenLoaderContextProvider,
                                        ModalProvider,
                                        SidePanelContextProvider,
                                        EditingCellProvider,
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
                            </View>
                        </SafeAreaProvider>
                    </GestureHandlerRootView>
                </InitialURLContextProvider>
            </SplashScreenStateContextProvider>
        </StrictModeWrapper>
    );
}

const WrappedApp = Sentry.wrap(App);
WrappedApp.displayName = 'App';
export default WrappedApp;
