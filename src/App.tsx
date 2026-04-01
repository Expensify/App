import {PortalProvider} from '@gorhom/portal';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useEffect, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {LogBox, useWindowDimensions as useRawWindowDimensions, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PickerStateProvider} from 'react-native-picker-select';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
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
import InboxSidePanel from './components/InboxSidePanel';
import {InboxPanelProvider, useInboxPanelState} from './components/InboxSidePanel/InboxPanelContext';
import InitialURLContextProvider from './components/InitialURLContextProvider';
import {InputBlurContextProvider} from './components/InputBlurContext';
import {KeyboardDismissibleFlatListContextProvider} from './components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext';
import KeyboardProvider from './components/KeyboardProvider';
import KYCWallContextProvider from './components/KYCWall/KYCWallContext';
import {LocaleContextProvider} from './components/LocaleContextProvider';
import {ModalProvider} from './components/Modal/Global/ModalContext';
import NavigationBar from './components/NavigationBar';
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
import ThemeStylesProvider from './components/ThemeStylesContextProvider';
import FullScreenContextProvider from './components/VideoPlayerContexts/FullScreenContextProvider';
import {PlaybackContextProvider} from './components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from './components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from './components/VideoPlayerContexts/VolumeContext';
import WideRHPContextProvider from './components/WideRHPContextProvider';
import {KeyboardStateProvider} from './components/withKeyboardState';
import CONFIG from './CONFIG';
import CONST from './CONST';
import Expensify from './Expensify';
import {CurrentReportIDContextProvider} from './hooks/useCurrentReportID';
import useDefaultDragAndDrop from './hooks/useDefaultDragAndDrop';
import useTheme from './hooks/useTheme';
import EffectiveWidthContext from './hooks/useWindowDimensions/EffectiveWidthContext';
import HybridAppHandler from './HybridAppHandler';
import OnyxUpdateManager from './libs/actions/OnyxUpdateManager';
import './libs/HybridApp';
import {AttachmentModalContextProvider} from './pages/media/AttachmentModalScreen/AttachmentModalContext';
import ExpensifyCardContextProvider from './pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardContextProvider';
import TravelCVVContextProvider from './pages/settings/Wallet/TravelCVVPage/TravelCVVContextProvider';
import './setup/backgroundLocationTrackingTask';
import './setup/backgroundTask';
import './setup/fraudProtection';
import './setup/hybridApp';
import {SplashScreenStateContextProvider} from './SplashScreenStateContext';

LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
]);

const fill = {flex: 1};

const PANEL_ANIMATION_DURATION = 300;

const StrictModeWrapper = CONFIG.USE_REACT_STRICT_MODE_IN_DEV ? React.StrictMode : ({children}: {children: React.ReactElement}) => children;

const FLOATING_PANEL_WIDTH = 375;
const FLOATING_PANEL_HEIGHT = 520;
const FLOATING_PANEL_MARGIN = 20;

function MainContent() {
    const {isOpen, isFloating} = useInboxPanelState();
    const {width: rawWindowWidth} = useRawWindowDimensions();
    const theme = useTheme();
    const panelWidth = Math.max(rawWindowWidth * 0.2, 350);

    // Measured width of the main content container, provided to all children via
    // EffectiveWidthContext so useWindowDimensions returns the true available width.
    const [mainContentWidth, setMainContentWidth] = useState(rawWindowWidth);
    const onMainContentLayout = useCallback((e: LayoutChangeEvent) => {
        setMainContentWidth(e.nativeEvent.layout.width);
    }, []);

    const panelWidthSV = useSharedValue(panelWidth);
    const panelContainerWidthSV = useSharedValue(0);
    const panelTranslateX = useSharedValue(panelWidth);

    // Docked panel animation — only active when not floating.
    useEffect(() => {
        if (isFloating) {
            // Collapse docked panel immediately when switching to floating.
            panelContainerWidthSV.value = 0;
            panelTranslateX.value = panelWidthSV.value;
            return;
        }
        const pw = Math.max(rawWindowWidth * 0.2, 350);
        panelWidthSV.value = pw;
        panelContainerWidthSV.value = withTiming(isOpen ? pw : 0, {duration: PANEL_ANIMATION_DURATION});
        panelTranslateX.value = withTiming(isOpen ? 0 : pw, {duration: PANEL_ANIMATION_DURATION});
        // SharedValue refs are stable — intentionally omitted from deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isFloating, rawWindowWidth]);

    // Panel outer container grows in the flex row, pushing the main content narrower.
    const panelContainerStyle = useAnimatedStyle(() => ({
        width: panelContainerWidthSV.value,
        overflow: 'hidden',
    }));

    // Panel inner stays at full panel width and slides in on x-axis — no text reflow.
    const panelInnerStyle = useAnimatedStyle(() => ({
        width: panelWidthSV.value,
        flex: 1,
        transform: [{translateX: panelTranslateX.value}],
        borderLeftWidth: 1,
        borderLeftColor: theme.border,
    }));

    // When floating, main content always takes the full viewport width.
    const effectiveWidth = isFloating ? rawWindowWidth : mainContentWidth;

    return (
        <View style={{flex: 1, flexDirection: 'row'}}>
            {/* EffectiveWidthContext provides the measured container width to every
                child that calls useWindowDimensions, so layout-critical screens
                (search, workspaces, settings, etc.) size themselves to the space
                actually available rather than the raw viewport. */}
            <EffectiveWidthContext.Provider value={effectiveWidth}>
                <View
                    style={fill}
                    onLayout={onMainContentLayout}
                >
                    <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                        <ColorSchemeWrapper>
                            <Expensify />
                        </ColorSchemeWrapper>
                    </ErrorBoundary>
                </View>
            </EffectiveWidthContext.Provider>
            {/* Docked panel — hidden when floating */}
            {!isFloating && (
                <Animated.View style={panelContainerStyle}>
                    <Animated.View style={panelInnerStyle}>
                        <InboxSidePanel />
                    </Animated.View>
                </Animated.View>
            )}
            {/* Floating panel — fixed bottom-right overlay */}
            {isFloating && isOpen && (
                <View
                    style={{
                        // position: 'fixed' is valid on RN web and keeps the panel
                        // in the viewport corner regardless of scroll position.
                        position: 'fixed' as 'absolute',
                        bottom: FLOATING_PANEL_MARGIN,
                        right: FLOATING_PANEL_MARGIN,
                        width: FLOATING_PANEL_WIDTH,
                        height: FLOATING_PANEL_HEIGHT,
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: theme.border,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 8},
                        shadowOpacity: 0.15,
                        shadowRadius: 24,
                    }}
                >
                    <InboxSidePanel />
                </View>
            )}
        </View>
    );
}

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
                                        TravelCVVContextProvider,
                                        KYCWallContextProvider,
                                        WideRHPContextProvider,
                                        InboxPanelProvider,
                                    ]}
                                >
                                    <CustomStatusBarAndBackground />
                                    <MainContent />
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
