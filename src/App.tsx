import {PortalProvider} from '@gorhom/portal';
import * as Sentry from '@sentry/react-native';
import React, {Suspense} from 'react';
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
import {EnvironmentProvider} from './components/EnvironmentContext';
import ErrorBoundary from './components/ErrorBoundary';
import FullScreenBlockingViewContextProvider from './components/FullScreenBlockingViewContextProvider';
import FullScreenLoaderContextProvider from './components/FullScreenLoaderContext';
import HTMLEngineProvider from './components/HTMLEngineProvider';
import InitialURLContextProvider from './components/InitialURLContextProvider';
import {InputBlurContextProvider} from './components/InputBlurContext';
import {KeyboardDismissibleFlatListContextProvider} from './components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext';
import KeyboardProvider from './components/KeyboardProvider';
import KYCWallContextProvider from './components/KYCWall/KYCWallContext';
import {LocaleContextProvider} from './components/LocaleContextProvider';
import {ModalProvider} from './components/Modal/Global/ModalContext';
import OnyxListItemProvider from './components/OnyxListItemProvider';
import PopoverContextProvider from './components/PopoverProvider';
import {ProductTrainingContextProvider} from './components/ProductTrainingContext';
import SafeArea from './components/SafeArea';
import ScrollOffsetContextProvider from './components/ScrollOffsetContextProvider';
import {SearchRouterContextProvider} from './components/Search/SearchRouter/SearchRouterContext';
import SidePanelContextProvider from './components/SidePanel/SidePanelContextProvider';
import SVGDefinitionsProvider from './components/SVGDefinitionsProvider';
import ThemeIllustrationsProvider from './components/ThemeIllustrationsProvider';
import ThemeProvider from './components/ThemeProvider';
import ThemeStylesProvider from './components/ThemeStylesProvider';
import {FullScreenContextProvider} from './components/VideoPlayerContexts/FullScreenContext';
import {PlaybackContextProvider} from './components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from './components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from './components/VideoPlayerContexts/VolumeContext';
import WideRHPContextProvider from './components/WideRHPContextProvider';
import {KeyboardStateProvider} from './components/withKeyboardState';
import CONFIG from './CONFIG';
import {FULLSTORY} from './CONST';
import Expensify from './Expensify';
import {CurrentReportIDContextProvider} from './hooks/useCurrentReportID';
import useDefaultDragAndDrop from './hooks/useDefaultDragAndDrop';
import HybridAppHandler from './HybridAppHandler';
import './libs/HybridApp';
import {AttachmentModalContextProvider} from './pages/media/AttachmentModalScreen/AttachmentModalContext';
import ExpensifyCardContextProvider from './pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardContextProvider';
import './setup/backgroundLocationTrackingTask';
import './setup/backgroundTask';
import './setup/fraudProtection';
import './setup/hybridApp';
import {SplashScreenStateContextProvider} from './SplashScreenStateContext';

const NavigationBar = React.lazy(() => import('./components/NavigationBar'));

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
                                fsClass={FULLSTORY.CLASS.UNMASK}
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
                                        AttachmentModalContextProvider,
                                        PickerStateProvider,
                                        EnvironmentProvider,
                                        CustomStatusBarAndBackgroundContextProvider,
                                        ActiveElementRoleProvider,
                                        ActionSheetAwareScrollViewProvider,
                                        PlaybackContextProvider,
                                        FullScreenContextProvider,
                                        VolumeContextProvider,
                                        VideoPopoverMenuContextProvider,
                                        KeyboardProvider,
                                        KeyboardStateProvider,
                                        KeyboardDismissibleFlatListContextProvider,
                                        SearchRouterContextProvider,
                                        ProductTrainingContextProvider,
                                        InputBlurContextProvider,
                                        FullScreenBlockingViewContextProvider,
                                        FullScreenLoaderContextProvider,
                                        ModalProvider,
                                        SidePanelContextProvider,
                                        ExpensifyCardContextProvider,
                                        KYCWallContextProvider,
                                        WideRHPContextProvider,
                                    ]}
                                >
                                    <CustomStatusBarAndBackground />
                                    <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                                        <ColorSchemeWrapper>
                                            <Expensify />
                                        </ColorSchemeWrapper>
                                    </ErrorBoundary>
                                    <Suspense fallback={null}>
                                        <NavigationBar />
                                    </Suspense>
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
