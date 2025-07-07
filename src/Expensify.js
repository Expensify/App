"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_av_1 = require("expo-av");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var ConfirmModal_1 = require("./components/ConfirmModal");
var DeeplinkWrapper_1 = require("./components/DeeplinkWrapper");
var EmojiPicker_1 = require("./components/EmojiPicker/EmojiPicker");
var GrowlNotification_1 = require("./components/GrowlNotification");
var AppleAuthWrapper_1 = require("./components/SignInButtons/AppleAuthWrapper");
var SplashScreenHider_1 = require("./components/SplashScreenHider");
var UpdateAppModal_1 = require("./components/UpdateAppModal");
var CONFIG_1 = require("./CONFIG");
var CONST_1 = require("./CONST");
var useDebugShortcut_1 = require("./hooks/useDebugShortcut");
var useIsAuthenticated_1 = require("./hooks/useIsAuthenticated");
var useLocalize_1 = require("./hooks/useLocalize");
var useOnyx_1 = require("./hooks/useOnyx");
var App_1 = require("./libs/actions/App");
var Delegate_1 = require("./libs/actions/Delegate");
var EmojiPickerAction = require("./libs/actions/EmojiPickerAction");
var Report = require("./libs/actions/Report");
var User = require("./libs/actions/User");
var ActiveClientManager = require("./libs/ActiveClientManager");
var Browser_1 = require("./libs/Browser");
var Environment = require("./libs/Environment/Environment");
var Fullstory_1 = require("./libs/Fullstory");
var Growl_1 = require("./libs/Growl");
var Log_1 = require("./libs/Log");
var migrateOnyx_1 = require("./libs/migrateOnyx");
var Navigation_1 = require("./libs/Navigation/Navigation");
var NavigationRoot_1 = require("./libs/Navigation/NavigationRoot");
var NetworkConnection_1 = require("./libs/NetworkConnection");
var PushNotification_1 = require("./libs/Notification/PushNotification");
require("./libs/Notification/PushNotification/subscribeToPushNotifications");
var setCrashlyticsUserId_1 = require("./libs/setCrashlyticsUserId");
var StartupTimer_1 = require("./libs/StartupTimer");
// This lib needs to be imported, but it has nothing to export since all it contains is an Onyx connection
require("./libs/UnreadIndicatorUpdater");
var Visibility_1 = require("./libs/Visibility");
var ONYXKEYS_1 = require("./ONYXKEYS");
var PopoverReportActionContextMenu_1 = require("./pages/home/report/ContextMenu/PopoverReportActionContextMenu");
var ReportActionContextMenu = require("./pages/home/report/ContextMenu/ReportActionContextMenu");
var SplashScreenStateContext_1 = require("./SplashScreenStateContext");
react_native_onyx_1.default.registerLogger(function (_a) {
    var level = _a.level, message = _a.message, parameters = _a.parameters;
    if (level === 'alert') {
        Log_1.default.alert(message, parameters);
        console.error(message);
        // useOnyx() calls with "canBeMissing" config set to false will display a visual alert in dev environment
        // when they don't return data.
        var shouldShowAlert = typeof parameters === 'object' && !Array.isArray(parameters) && 'showAlert' in parameters && 'key' in parameters;
        if (Environment.isDevelopment() && shouldShowAlert) {
            Growl_1.default.error("".concat(message, " Key: ").concat(parameters.key), 10000);
        }
    }
    else if (level === 'hmmm') {
        Log_1.default.hmmm(message, parameters);
    }
    else {
        Log_1.default.info(message, undefined, parameters);
    }
});
function Expensify() {
    var _a, _b;
    var appStateChangeListener = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(false), isNavigationReady = _c[0], setIsNavigationReady = _c[1];
    var _d = (0, react_1.useState)(false), isOnyxMigrated = _d[0], setIsOnyxMigrated = _d[1];
    var _e = (0, react_1.useContext)(SplashScreenStateContext_1.default), splashScreenState = _e.splashScreenState, setSplashScreenState = _e.setSplashScreenState;
    var _f = (0, react_1.useState)(false), hasAttemptedToOpenPublicRoom = _f[0], setAttemptedToOpenPublicRoom = _f[1];
    var _g = (0, useLocalize_1.default)(), translate = _g.translate, preferredLocale = _g.preferredLocale;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var lastRoute = (0, useOnyx_1.default)(ONYXKEYS_1.default.LAST_ROUTE, { canBeMissing: true })[0];
    var userMetadata = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_METADATA, { canBeMissing: true })[0];
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_CHECKING_PUBLIC_ROOM, { initWithStoredValues: false, canBeMissing: true })[0], isCheckingPublicRoom = _h === void 0 ? true : _h;
    var updateAvailable = (0, useOnyx_1.default)(ONYXKEYS_1.default.UPDATE_AVAILABLE, { initWithStoredValues: false, canBeMissing: true })[0];
    var updateRequired = (0, useOnyx_1.default)(ONYXKEYS_1.default.UPDATE_REQUIRED, { initWithStoredValues: false, canBeMissing: true })[0];
    var isSidebarLoaded = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SIDEBAR_LOADED, { canBeMissing: true })[0];
    var screenShareRequest = (0, useOnyx_1.default)(ONYXKEYS_1.default.SCREEN_SHARE_REQUEST, { canBeMissing: true })[0];
    var lastVisitedPath = (0, useOnyx_1.default)(ONYXKEYS_1.default.LAST_VISITED_PATH, { canBeMissing: true })[0];
    (0, useDebugShortcut_1.default)();
    var _j = (0, react_1.useState)(null), initialUrl = _j[0], setInitialUrl = _j[1];
    (0, react_1.useEffect)(function () {
        if (isCheckingPublicRoom) {
            return;
        }
        setAttemptedToOpenPublicRoom(true);
    }, [isCheckingPublicRoom]);
    var isAuthenticated = (0, useIsAuthenticated_1.default)();
    var autoAuthState = (0, react_1.useMemo)(function () { var _a; return (_a = session === null || session === void 0 ? void 0 : session.autoAuthState) !== null && _a !== void 0 ? _a : ''; }, [session]);
    var shouldInit = isNavigationReady && hasAttemptedToOpenPublicRoom && !!preferredLocale;
    var isSplashVisible = splashScreenState === CONST_1.default.BOOT_SPLASH_STATE.VISIBLE;
    var isHybridAppReady = splashScreenState === CONST_1.default.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN && isAuthenticated;
    var shouldHideSplash = shouldInit && (CONFIG_1.default.IS_HYBRID_APP ? isHybridAppReady : isSplashVisible);
    var initializeClient = function () {
        if (!Visibility_1.default.isVisible()) {
            return;
        }
        // Delay client init to avoid issues with delayed Onyx events on iOS. All iOS browsers use WebKit, which suspends events in background tabs.
        // Events are flushed only when the tab becomes active again causing issues with client initialization.
        // See: https://stackoverflow.com/questions/54095584/page-becomes-inactive-when-switching-tabs-on-ios
        if ((0, Browser_1.isSafari)()) {
            setTimeout(ActiveClientManager.init, 400);
        }
        else {
            ActiveClientManager.init();
        }
    };
    var setNavigationReady = (0, react_1.useCallback)(function () {
        setIsNavigationReady(true);
        // Navigate to any pending routes now that the NavigationContainer is ready
        Navigation_1.default.setIsNavigationReady();
    }, []);
    var onSplashHide = (0, react_1.useCallback)(function () {
        setSplashScreenState(CONST_1.default.BOOT_SPLASH_STATE.HIDDEN);
    }, [setSplashScreenState]);
    (0, react_1.useLayoutEffect)(function () {
        // Initialize this client as being an active client
        ActiveClientManager.init();
        // Used for the offline indicator appearing when someone is offline
        var unsubscribeNetInfo = NetworkConnection_1.default.subscribeToNetInfo();
        return unsubscribeNetInfo;
    }, []);
    (0, react_1.useEffect)(function () {
        // Initialize Fullstory lib
        Fullstory_1.default.init(userMetadata);
    }, [userMetadata]);
    // Log the platform and config to debug .env issues
    (0, react_1.useEffect)(function () {
        Log_1.default.info('App launched', false, { Platform: react_native_1.Platform, CONFIG: CONFIG_1.default });
    }, []);
    (0, react_1.useEffect)(function () {
        setTimeout(function () {
            var appState = react_native_1.AppState.currentState;
            Log_1.default.info('[BootSplash] splash screen status', false, { appState: appState, splashScreenState: splashScreenState });
            if (splashScreenState === CONST_1.default.BOOT_SPLASH_STATE.VISIBLE) {
                var propsToLog = {
                    isCheckingPublicRoom: isCheckingPublicRoom,
                    updateRequired: updateRequired,
                    updateAvailable: updateAvailable,
                    isSidebarLoaded: isSidebarLoaded,
                    screenShareRequest: screenShareRequest,
                    isAuthenticated: isAuthenticated,
                    lastVisitedPath: lastVisitedPath,
                };
                Log_1.default.alert('[BootSplash] splash screen is still visible', { propsToLog: propsToLog }, false);
            }
        }, 30 * 1000);
        // This timer is set in the native layer when launching the app and we stop it here so we can measure how long
        // it took for the main app itself to load.
        StartupTimer_1.default.stop();
        // Run any Onyx schema migrations and then continue loading the main app
        (0, migrateOnyx_1.default)().then(function () {
            // In case of a crash that led to disconnection, we want to remove all the push notifications.
            if (!isAuthenticated) {
                PushNotification_1.default.clearNotifications();
            }
            setIsOnyxMigrated(true);
        });
        appStateChangeListener.current = react_native_1.AppState.addEventListener('change', initializeClient);
        // If the app is opened from a deep link, get the reportID (if exists) from the deep link and navigate to the chat report
        react_native_1.Linking.getInitialURL().then(function (url) {
            // We use custom deeplink handler in setup/hybridApp
            if (CONFIG_1.default.IS_HYBRID_APP) {
                Report.doneCheckingPublicRoom();
                return;
            }
            setInitialUrl(url);
            Report.openReportFromDeepLink(url !== null && url !== void 0 ? url : '');
        });
        // Open chat report from a deep link (only mobile native)
        react_native_1.Linking.addEventListener('url', function (state) {
            // We use custom deeplink handler in setup/hybridApp
            if (CONFIG_1.default.IS_HYBRID_APP) {
                return;
            }
            Report.openReportFromDeepLink(state.url);
        });
        return function () {
            if (!appStateChangeListener.current) {
                return;
            }
            appStateChangeListener.current.remove();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, []);
    // This is being done since we want to play sound even when iOS device is on silent mode, to align with other platforms.
    (0, react_1.useEffect)(function () {
        expo_av_1.Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }, []);
    (0, react_1.useLayoutEffect)(function () {
        if (!isNavigationReady || !lastRoute) {
            return;
        }
        (0, App_1.updateLastRoute)('');
        Navigation_1.default.navigate(lastRoute);
        // Disabling this rule because we only want it to run on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isNavigationReady]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!isAuthenticated) {
            return;
        }
        (0, setCrashlyticsUserId_1.default)((_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID);
    }, [isAuthenticated, session === null || session === void 0 ? void 0 : session.accountID]);
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        if (!((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate)) {
            return;
        }
        if ((_c = (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegates) === null || _c === void 0 ? void 0 : _c.some(function (d) { var _a; return d.email === ((_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegate); })) {
            return;
        }
        (0, Delegate_1.disconnect)();
    }, [(_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegates, (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegate]);
    // Display a blank page until the onyx migration completes
    if (!isOnyxMigrated) {
        return null;
    }
    if (updateRequired) {
        throw new Error(CONST_1.default.ERROR.UPDATE_REQUIRED);
    }
    return (<DeeplinkWrapper_1.default isAuthenticated={isAuthenticated} autoAuthState={autoAuthState} initialUrl={initialUrl !== null && initialUrl !== void 0 ? initialUrl : ''}>
            {shouldInit && (<>
                    <GrowlNotification_1.default ref={Growl_1.growlRef}/>
                    <PopoverReportActionContextMenu_1.default ref={ReportActionContextMenu.contextMenuRef}/>
                    <EmojiPicker_1.default ref={EmojiPickerAction.emojiPickerRef}/>
                    {/* We include the modal for showing a new update at the top level so the option is always present. */}
                    {updateAvailable && !updateRequired ? <UpdateAppModal_1.default /> : null}
                    {screenShareRequest ? (<ConfirmModal_1.default title={translate('guides.screenShare')} onConfirm={function () { return User.joinScreenShare(screenShareRequest.accessToken, screenShareRequest.roomName); }} onCancel={User.clearScreenShareRequest} prompt={translate('guides.screenShareRequest')} confirmText={translate('common.join')} cancelText={translate('common.decline')} isVisible/>) : null}
                </>)}

            <AppleAuthWrapper_1.default />
            {hasAttemptedToOpenPublicRoom && (<NavigationRoot_1.default onReady={setNavigationReady} authenticated={isAuthenticated} lastVisitedPath={lastVisitedPath} initialUrl={initialUrl}/>)}
            {shouldHideSplash && <SplashScreenHider_1.default onHide={onSplashHide}/>}
        </DeeplinkWrapper_1.default>);
}
Expensify.displayName = 'Expensify';
exports.default = Expensify;
