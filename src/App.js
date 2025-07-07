"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_picker_select_1 = require("react-native-picker-select");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
require("../wdyr");
var ActionSheetAwareScrollView_1 = require("./components/ActionSheetAwareScrollView");
var ActiveElementRoleProvider_1 = require("./components/ActiveElementRoleProvider");
var ColorSchemeWrapper_1 = require("./components/ColorSchemeWrapper");
var ComposeProviders_1 = require("./components/ComposeProviders");
var CustomStatusBarAndBackground_1 = require("./components/CustomStatusBarAndBackground");
var CustomStatusBarAndBackgroundContextProvider_1 = require("./components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContextProvider");
var ErrorBoundary_1 = require("./components/ErrorBoundary");
var FullScreenBlockingViewContextProvider_1 = require("./components/FullScreenBlockingViewContextProvider");
var FullScreenLoaderContext_1 = require("./components/FullScreenLoaderContext");
var HTMLEngineProvider_1 = require("./components/HTMLEngineProvider");
var InitialURLContextProvider_1 = require("./components/InitialURLContextProvider");
var InputBlurContext_1 = require("./components/InputBlurContext");
var KeyboardProvider_1 = require("./components/KeyboardProvider");
var LocaleContextProvider_1 = require("./components/LocaleContextProvider");
var NavigationBar_1 = require("./components/NavigationBar");
var OnyxProvider_1 = require("./components/OnyxProvider");
var PopoverProvider_1 = require("./components/PopoverProvider");
var ProductTrainingContext_1 = require("./components/ProductTrainingContext");
var SafeArea_1 = require("./components/SafeArea");
var ScrollOffsetContextProvider_1 = require("./components/ScrollOffsetContextProvider");
var SearchRouterContext_1 = require("./components/Search/SearchRouter/SearchRouterContext");
var ThemeIllustrationsProvider_1 = require("./components/ThemeIllustrationsProvider");
var ThemeProvider_1 = require("./components/ThemeProvider");
var ThemeStylesProvider_1 = require("./components/ThemeStylesProvider");
var FullScreenContext_1 = require("./components/VideoPlayerContexts/FullScreenContext");
var PlaybackContext_1 = require("./components/VideoPlayerContexts/PlaybackContext");
var VideoPopoverMenuContext_1 = require("./components/VideoPlayerContexts/VideoPopoverMenuContext");
var VolumeContext_1 = require("./components/VideoPlayerContexts/VolumeContext");
var withEnvironment_1 = require("./components/withEnvironment");
var withKeyboardState_1 = require("./components/withKeyboardState");
var CONFIG_1 = require("./CONFIG");
var Expensify_1 = require("./Expensify");
var useCurrentReportID_1 = require("./hooks/useCurrentReportID");
var useDefaultDragAndDrop_1 = require("./hooks/useDefaultDragAndDrop");
var HybridAppHandler_1 = require("./HybridAppHandler");
var OnyxUpdateManager_1 = require("./libs/actions/OnyxUpdateManager");
var AttachmentModalContext_1 = require("./pages/media/AttachmentModalScreen/AttachmentModalContext");
require("./setup/backgroundTask");
require("./setup/hybridApp");
var SplashScreenStateContext_1 = require("./SplashScreenStateContext");
react_native_1.LogBox.ignoreLogs([
    // Basically it means that if the app goes in the background and back to foreground on Android,
    // the timer is lost. Currently Expensify is using a 30 minutes interval to refresh personal details.
    // More details here: https://git.io/JJYeb
    'Setting a timer for a long period of time',
    // We are not using expo-const, so ignore the warning.
    'No native ExponentConstants module found',
]);
var fill = { flex: 1 };
var StrictModeWrapper = CONFIG_1.default.USE_REACT_STRICT_MODE_IN_DEV ? react_1.default.StrictMode : function (_a) {
    var children = _a.children;
    return children;
};
function App(_a) {
    var url = _a.url, hybridAppSettings = _a.hybridAppSettings;
    (0, useDefaultDragAndDrop_1.default)();
    (0, OnyxUpdateManager_1.default)();
    return (<StrictModeWrapper>
            <SplashScreenStateContext_1.SplashScreenStateContextProvider>
                <InitialURLContextProvider_1.default url={url}>
                    <HybridAppHandler_1.default hybridAppSettings={hybridAppSettings}/>
                    <react_native_gesture_handler_1.GestureHandlerRootView style={fill}>
                        <ComposeProviders_1.default components={[
            OnyxProvider_1.default,
            ThemeProvider_1.default,
            ThemeStylesProvider_1.default,
            ThemeIllustrationsProvider_1.default,
            react_native_safe_area_context_1.SafeAreaProvider,
            portal_1.PortalProvider,
            SafeArea_1.default,
            LocaleContextProvider_1.LocaleContextProvider,
            HTMLEngineProvider_1.default,
            PopoverProvider_1.default,
            useCurrentReportID_1.CurrentReportIDContextProvider,
            ScrollOffsetContextProvider_1.default,
            AttachmentModalContext_1.AttachmentModalContextProvider,
            react_native_picker_select_1.PickerStateProvider,
            withEnvironment_1.EnvironmentProvider,
            CustomStatusBarAndBackgroundContextProvider_1.default,
            ActiveElementRoleProvider_1.default,
            ActionSheetAwareScrollView_1.ActionSheetAwareScrollViewProvider,
            PlaybackContext_1.PlaybackContextProvider,
            FullScreenContext_1.FullScreenContextProvider,
            VolumeContext_1.VolumeContextProvider,
            VideoPopoverMenuContext_1.VideoPopoverMenuContextProvider,
            KeyboardProvider_1.default,
            withKeyboardState_1.KeyboardStateProvider,
            SearchRouterContext_1.SearchRouterContextProvider,
            ProductTrainingContext_1.ProductTrainingContextProvider,
            InputBlurContext_1.InputBlurContextProvider,
            FullScreenBlockingViewContextProvider_1.default,
            FullScreenLoaderContext_1.default,
        ]}>
                            <CustomStatusBarAndBackground_1.default />
                            <ErrorBoundary_1.default errorMessage="NewExpensify crash caught by error boundary">
                                <ColorSchemeWrapper_1.default>
                                    <Expensify_1.default />
                                </ColorSchemeWrapper_1.default>
                            </ErrorBoundary_1.default>
                            <NavigationBar_1.default />
                        </ComposeProviders_1.default>
                    </react_native_gesture_handler_1.GestureHandlerRootView>
                </InitialURLContextProvider_1.default>
            </SplashScreenStateContext_1.SplashScreenStateContextProvider>
        </StrictModeWrapper>);
}
App.displayName = 'App';
exports.default = App;
