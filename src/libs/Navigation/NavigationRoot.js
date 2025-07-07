"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ScrollOffsetContextProvider_1 = require("@components/ScrollOffsetContextProvider");
var useCurrentReportID_1 = require("@hooks/useCurrentReportID");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemePreference_1 = require("@hooks/useThemePreference");
var Firebase_1 = require("@libs/Firebase");
var Fullstory_1 = require("@libs/Fullstory");
var Log_1 = require("@libs/Log");
var onboardingSelectors_1 = require("@libs/onboardingSelectors");
var shouldOpenLastVisitedPath_1 = require("@libs/shouldOpenLastVisitedPath");
var Url_1 = require("@libs/Url");
var App_1 = require("@userActions/App");
var Welcome_1 = require("@userActions/Welcome");
var OnboardingFlow_1 = require("@userActions/Welcome/OnboardingFlow");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var AppNavigator_1 = require("./AppNavigator");
var usePreserveNavigatorState_1 = require("./AppNavigator/createSplitNavigator/usePreserveNavigatorState");
var getAdaptedStateFromPath_1 = require("./helpers/getAdaptedStateFromPath");
var isNavigatorName_1 = require("./helpers/isNavigatorName");
var lastVisitedTabPathUtils_1 = require("./helpers/lastVisitedTabPathUtils");
var linkingConfig_1 = require("./linkingConfig");
var Navigation_1 = require("./Navigation");
/**
 * Intercept navigation state changes and log it
 */
function parseAndLogRoute(state) {
    var _a, _b;
    if (!state) {
        return;
    }
    var currentPath = (0, native_1.getPathFromState)(state, linkingConfig_1.linkingConfig.config);
    var focusedRoute = (0, native_1.findFocusedRoute)(state);
    if (focusedRoute && !CONST_1.default.EXCLUDE_FROM_LAST_VISITED_PATH.includes(focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name)) {
        (0, App_1.updateLastVisitedPath)(currentPath);
        if (currentPath.startsWith("/".concat(ROUTES_1.default.ONBOARDING_ROOT.route))) {
            (0, Welcome_1.updateOnboardingLastVisitedPath)(currentPath);
        }
    }
    // Don't log the route transitions from OldDot because they contain authTokens
    if (currentPath.includes('/transition')) {
        Log_1.default.info('Navigating from transition link from OldDot using short lived authToken');
    }
    else {
        Log_1.default.info('Navigating to route', false, { path: currentPath });
    }
    Navigation_1.default.setIsNavigationReady();
    if ((0, isNavigatorName_1.isWorkspacesTabScreenName)((_a = state.routes.at(-1)) === null || _a === void 0 ? void 0 : _a.name)) {
        (0, lastVisitedTabPathUtils_1.saveWorkspacesTabPathToSessionStorage)(currentPath);
    }
    else if (((_b = state.routes.at(-1)) === null || _b === void 0 ? void 0 : _b.name) === NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR) {
        (0, lastVisitedTabPathUtils_1.saveSettingsTabPathToSessionStorage)(currentPath);
    }
    // Fullstory Page navigation tracking
    var focusedRouteName = focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name;
    if (focusedRouteName) {
        new Fullstory_1.FSPage(focusedRouteName, { path: currentPath }).start();
    }
}
function NavigationRoot(_a) {
    var authenticated = _a.authenticated, lastVisitedPath = _a.lastVisitedPath, initialUrl = _a.initialUrl, onReady = _a.onReady;
    var firstRenderRef = (0, react_1.useRef)(true);
    var themePreference = (0, useThemePreference_1.default)();
    var theme = (0, useTheme_1.default)();
    var cleanStaleScrollOffsets = (0, react_1.useContext)(ScrollOffsetContextProvider_1.ScrollOffsetContext).cleanStaleScrollOffsets;
    var currentReportIDValue = (0, useCurrentReportID_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, {
        selector: onboardingSelectors_1.hasCompletedGuidedSetupFlowSelector,
        canBeMissing: true,
    })[0], isOnboardingCompleted = _b === void 0 ? true : _b;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_INTRO_SELECTED, {
        selector: onboardingSelectors_1.wasInvitedToNewDotSelector,
        canBeMissing: true,
    })[0], wasInvitedToNewDot = _c === void 0 ? false : _c;
    var hasNonPersonalPolicy = (0, useOnyx_1.default)(ONYXKEYS_1.default.HAS_NON_PERSONAL_POLICY, { canBeMissing: true })[0];
    var previousAuthenticated = (0, usePrevious_1.default)(authenticated);
    var initialState = (0, react_1.useMemo)(function () {
        var path = initialUrl ? (0, Url_1.getPathFromURL)(initialUrl) : null;
        if ((path === null || path === void 0 ? void 0 : path.includes(ROUTES_1.default.MIGRATED_USER_WELCOME_MODAL.route)) && (0, shouldOpenLastVisitedPath_1.default)(lastVisitedPath) && isOnboardingCompleted && authenticated) {
            Navigation_1.default.isNavigationReady().then(function () {
                Navigation_1.default.navigate(ROUTES_1.default.MIGRATED_USER_WELCOME_MODAL.getRoute());
            });
            return (0, getAdaptedStateFromPath_1.default)(lastVisitedPath, linkingConfig_1.linkingConfig.config);
        }
        if (!account || account.isFromPublicDomain) {
            return;
        }
        var shouldShowRequire2FAPage = !!(account === null || account === void 0 ? void 0 : account.needsTwoFactorAuthSetup) && !account.requiresTwoFactorAuth;
        if (shouldShowRequire2FAPage) {
            return (0, getAdaptedStateFromPath_1.default)(ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH, linkingConfig_1.linkingConfig.config);
        }
        var isTransitioning = path === null || path === void 0 ? void 0 : path.includes(ROUTES_1.default.TRANSITION_BETWEEN_APPS);
        // If the user haven't completed the flow, we want to always redirect them to the onboarding flow.
        // We also make sure that the user is authenticated, isn't part of a group workspace, isn't in the transition flow & wasn't invited to NewDot.
        if (!CONFIG_1.default.IS_HYBRID_APP && !hasNonPersonalPolicy && !isOnboardingCompleted && !wasInvitedToNewDot && authenticated && !isTransitioning) {
            return (0, getAdaptedStateFromPath_1.default)((0, OnboardingFlow_1.getOnboardingInitialPath)({
                isUserFromPublicDomain: !!account.isFromPublicDomain,
                hasAccessiblePolicies: !!account.hasAccessibleDomainPolicies,
            }), linkingConfig_1.linkingConfig.config);
        }
        // If there is no lastVisitedPath, we can do early return. We won't modify the default behavior.
        // The same applies to HybridApp, as we always define the route to which we want to transition.
        if (!(0, shouldOpenLastVisitedPath_1.default)(lastVisitedPath) || CONFIG_1.default.IS_HYBRID_APP) {
            return undefined;
        }
        // If the user opens the root of app "/" it will be parsed to empty string "".
        // If the path is defined and different that empty string we don't want to modify the default behavior.
        if (path) {
            return;
        }
        // Otherwise we want to redirect the user to the last visited path.
        return (0, getAdaptedStateFromPath_1.default)(lastVisitedPath, linkingConfig_1.linkingConfig.config);
        // The initialState value is relevant only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    // https://reactnavigation.org/docs/themes
    var navigationTheme = (0, react_1.useMemo)(function () {
        var defaultNavigationTheme = themePreference === CONST_1.default.THEME.DARK ? native_1.DarkTheme : native_1.DefaultTheme;
        return __assign(__assign({}, defaultNavigationTheme), { colors: __assign(__assign({}, defaultNavigationTheme.colors), { background: theme.appBG }) });
    }, [theme.appBG, themePreference]);
    (0, react_1.useEffect)(function () {
        if (firstRenderRef.current) {
            // we don't want to make the report back button go back to LHN if the user
            // started on the small screen so we don't set it on the first render
            // making it only work on consecutive changes of the screen size
            firstRenderRef.current = false;
            return;
        }
        // After resizing the screen from wide to narrow, if we have visited multiple central screens, we want to go back to the LHN screen, so we set shouldPopToSidebar to true.
        // Now when this value is true, Navigation.goBack with the option {shouldPopToTop: true} will remove all visited central screens in the given tab from the navigation stack and go back to the LHN.
        // More context here: https://github.com/Expensify/App/pull/59300
        if (!shouldUseNarrowLayout) {
            return;
        }
        Navigation_1.default.setShouldPopToSidebar(true);
    }, [shouldUseNarrowLayout]);
    (0, react_1.useEffect)(function () {
        // Since the NAVIGATORS.REPORTS_SPLIT_NAVIGATOR url is "/" and it has to be used as an URL for SignInPage,
        // this navigator should be the only one in the navigation state after logout.
        var hasUserLoggedOut = !authenticated && !!previousAuthenticated;
        if (!hasUserLoggedOut || !Navigation_1.navigationRef.isReady()) {
            return;
        }
        var rootState = Navigation_1.navigationRef.getRootState();
        var lastRoute = rootState.routes.at(-1);
        if (!lastRoute) {
            return;
        }
        // REPORTS_SPLIT_NAVIGATOR will persist after user logout, because it is used both for logged-in and logged-out users
        // That's why for ReportsSplit we need to explicitly clear params when resetting navigation state,
        // However in case other routes (related to login/logout) appear in nav state, then we want to preserve params for those
        var isReportSplitNavigatorMounted = lastRoute.name === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR;
        Navigation_1.navigationRef.reset(__assign(__assign({}, rootState), { index: 0, routes: [
                __assign(__assign({}, lastRoute), { params: isReportSplitNavigatorMounted ? undefined : lastRoute.params }),
            ] }));
    }, [authenticated, previousAuthenticated]);
    var handleStateChange = function (state) {
        var _a;
        if (!state) {
            return;
        }
        var currentRoute = Navigation_1.navigationRef.getCurrentRoute();
        Firebase_1.default.log("[NAVIGATION] screen: ".concat(currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.name, ", params: ").concat(JSON.stringify((_a = currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.params) !== null && _a !== void 0 ? _a : {})));
        // Performance optimization to avoid context consumers to delay first render
        setTimeout(function () {
            currentReportIDValue === null || currentReportIDValue === void 0 ? void 0 : currentReportIDValue.updateCurrentReportID(state);
        }, 0);
        parseAndLogRoute(state);
        // We want to clean saved scroll offsets for screens that aren't anymore in the state.
        cleanStaleScrollOffsets(state);
        (0, usePreserveNavigatorState_1.cleanPreservedNavigatorStates)(state);
    };
    return (<native_1.NavigationContainer initialState={initialState} onStateChange={handleStateChange} onReady={onReady} theme={navigationTheme} ref={Navigation_1.navigationRef} linking={linkingConfig_1.linkingConfig} documentTitle={{
            enabled: false,
        }}>
            <AppNavigator_1.default authenticated={authenticated}/>
        </native_1.NavigationContainer>);
}
NavigationRoot.displayName = 'NavigationRoot';
exports.default = NavigationRoot;
