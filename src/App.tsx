import {PortalProvider} from '@gorhom/portal';
import * as Sentry from '@sentry/react-native';
import {maybeCompleteAuthSession} from 'expo-web-browser';
import React, {useEffect} from 'react';
// eslint-disable-next-line no-restricted-imports
import {LogBox, useWindowDimensions as useRawWindowDimensions, View} from 'react-native';
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
import useTheme from './hooks/useTheme';
import EffectiveWidthContext from './hooks/useWindowDimensions/EffectiveWidthContext';
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

    const panelWidthSV = useSharedValue(panelWidth);
    const panelTranslateX = useSharedValue(panelWidth);

    // Animate translateX for the docked slide-in. When floating, snap to full-width with no
    // translate so the panel fills its fixed container. The container width/position itself
    // is set via React state (one re-render on open/close) to avoid ResizeObserver firing on
    // every animation frame and cascading re-renders through EffectiveWidthContext.
    useEffect(() => {
        if (isFloating) {
            panelWidthSV.value = FLOATING_PANEL_WIDTH;
            panelTranslateX.value = 0;
            return;
        }
        const pw = Math.max(rawWindowWidth * 0.2, 350);
        panelWidthSV.value = pw;
        panelTranslateX.value = withTiming(isOpen ? 0 : pw, {duration: PANEL_ANIMATION_DURATION});
        // SharedValue refs are stable — intentionally omitted from deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isFloating, rawWindowWidth]);

    // Inner panel slides on x-axis. Width and translate are driven by shared values so
    // they work for both docked (slide animation) and floating (no animation) modes.
    const panelInnerStyle = useAnimatedStyle(() => ({
        width: panelWidthSV.value,
        flex: 1,
        transform: [{translateX: panelTranslateX.value}],
    }));

    // Derived directly from isOpen — avoids onLayout/ResizeObserver updates during animation.
    const effectiveWidth = isFloating || !isOpen ? rawWindowWidth : rawWindowWidth - panelWidth;

    // Outer panel container switches between docked (in-flow) and floating (fixed overlay).
    // Keeping a single <InboxSidePanel /> in the JSX tree regardless of mode prevents the
    // NavigationContainer from remounting every time the user toggles floating.
    const panelOuterStyle = isFloating
        ? {
              position: 'fixed' as 'absolute',
              bottom: FLOATING_PANEL_MARGIN,
              right: FLOATING_PANEL_MARGIN,
              width: FLOATING_PANEL_WIDTH,
              height: FLOATING_PANEL_HEIGHT,
              display: (isOpen ? 'flex' : 'none') as 'flex' | 'none',
              borderRadius: 12,
              overflow: 'hidden' as const,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 8},
              shadowOpacity: 0.15,
              shadowRadius: 24,
          }
        : {
              width: isOpen ? panelWidth : 0,
              overflow: 'hidden' as const,
              borderLeftWidth: 1,
              borderLeftColor: theme.border,
          };

    return (
        <View style={{flex: 1, flexDirection: 'row'}}>
            {/* EffectiveWidthContext provides the measured container width to every
                child that calls useWindowDimensions, so layout-critical screens
                (search, workspaces, settings, etc.) size themselves to the space
                actually available rather than the raw viewport. */}
            <EffectiveWidthContext.Provider value={effectiveWidth}>
                <View style={fill}>
                    <ErrorBoundary errorMessage="NewExpensify crash caught by error boundary">
                        <ColorSchemeWrapper>
                            <Expensify />
                        </ColorSchemeWrapper>
                    </ErrorBoundary>
                </View>
            </EffectiveWidthContext.Provider>
            {/* Single InboxSidePanel instance — style switches between docked and floating.
                Keeping it at a fixed JSX tree position prevents NavigationContainer remounts. */}
            <View style={panelOuterStyle}>
                <Animated.View style={panelInnerStyle}>
                    <InboxSidePanel />
                </Animated.View>
            </View>
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
