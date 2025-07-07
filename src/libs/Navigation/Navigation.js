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
exports.navigationRef = void 0;
var core_1 = require("@react-navigation/core");
var native_1 = require("@react-navigation/native");
// eslint-disable-next-line you-dont-need-lodash-underscore/omit
var omit_1 = require("lodash/omit");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Log_1 = require("@libs/Log");
var ObjectUtils_1 = require("@libs/ObjectUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var getInitialSplitNavigatorState_1 = require("./AppNavigator/createSplitNavigator/getInitialSplitNavigatorState");
var closeRHPFlow_1 = require("./helpers/closeRHPFlow");
var getStateFromPath_1 = require("./helpers/getStateFromPath");
var getTopmostReportParams_1 = require("./helpers/getTopmostReportParams");
var isNavigatorName_1 = require("./helpers/isNavigatorName");
var isReportOpenInRHP_1 = require("./helpers/isReportOpenInRHP");
var isSideModalNavigator_1 = require("./helpers/isSideModalNavigator");
var linkTo_1 = require("./helpers/linkTo");
var getMinimalAction_1 = require("./helpers/linkTo/getMinimalAction");
var replaceWithSplitNavigator_1 = require("./helpers/replaceWithSplitNavigator");
var setNavigationActionToMicrotaskQueue_1 = require("./helpers/setNavigationActionToMicrotaskQueue");
var linkingConfig_1 = require("./linkingConfig");
var RELATIONS_1 = require("./linkingConfig/RELATIONS");
var navigationRef_1 = require("./navigationRef");
exports.navigationRef = navigationRef_1.default;
// Routes which are part of the flow to set up 2FA
var SET_UP_2FA_ROUTES = [
    ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH,
    ROUTES_1.default.SETTINGS_2FA_ROOT.getRoute(ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH),
    ROUTES_1.default.SETTINGS_2FA_VERIFY.getRoute(ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH),
    ROUTES_1.default.SETTINGS_2FA_SUCCESS.getRoute(ROUTES_1.default.REQUIRE_TWO_FACTOR_AUTH),
];
var account;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.ACCOUNT,
    callback: function (value) {
        account = value;
    },
});
function shouldShowRequire2FAPage() {
    return !!(account === null || account === void 0 ? void 0 : account.needsTwoFactorAuthSetup) && !(account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth);
}
var resolveNavigationIsReadyPromise;
var navigationIsReadyPromise = new Promise(function (resolve) {
    resolveNavigationIsReadyPromise = resolve;
});
var pendingRoute = null;
var shouldPopToSidebar = false;
/**
 * Inform the navigation that next time user presses UP we should pop all the state back to LHN.
 */
function setShouldPopToSidebar(shouldPopAllStateFlag) {
    shouldPopToSidebar = shouldPopAllStateFlag;
}
/**
 * Returns shouldPopToSidebar variable used to determine whether should we pop all state back to LHN
 * @returns shouldPopToSidebar
 */
function getShouldPopToSidebar() {
    return shouldPopToSidebar;
}
/**
 * Checks if the route can be navigated to based on whether the navigation ref is ready and if 2FA is required to be set up.
 */
function canNavigate(methodName, params) {
    var _a;
    if (params === void 0) { params = {}; }
    // Block navigation if 2FA is required and the targetRoute is not part of the flow to enable 2FA
    var targetRoute = (_a = params.route) !== null && _a !== void 0 ? _a : params.backToRoute;
    if (shouldShowRequire2FAPage() && targetRoute && !SET_UP_2FA_ROUTES.includes(targetRoute)) {
        Log_1.default.info("[Navigation] Blocked navigation because 2FA is required to be set up to access route: ".concat(targetRoute));
        return false;
    }
    if (navigationRef_1.default.isReady()) {
        return true;
    }
    Log_1.default.hmmm("[Navigation] ".concat(methodName, " failed because navigation ref was not yet ready"), params);
    return false;
}
/**
 * Extracts from the topmost report its id.
 */
var getTopmostReportId = function (state) {
    var _a;
    if (state === void 0) { state = navigationRef_1.default.getState(); }
    return (_a = (0, getTopmostReportParams_1.default)(state)) === null || _a === void 0 ? void 0 : _a.reportID;
};
/**
 * Extracts from the topmost report its action id.
 */
var getTopmostReportActionId = function (state) {
    var _a;
    if (state === void 0) { state = navigationRef_1.default.getState(); }
    return (_a = (0, getTopmostReportParams_1.default)(state)) === null || _a === void 0 ? void 0 : _a.reportActionID;
};
/**
 * Re-exporting the closeRHPFlow here to fill in default value for navigationRef. The closeRHPFlow isn't defined in this file to avoid cyclic dependencies.
 */
var closeRHPFlow = function (ref) {
    if (ref === void 0) { ref = navigationRef_1.default; }
    return (0, closeRHPFlow_1.default)(ref);
};
/**
 * Function that generates dynamic urls from paths passed from OldDot.
 */
function parseHybridAppUrl(url) {
    switch (url) {
        case ROUTES_1.HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL:
            return ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, (0, ReportUtils_1.generateReportID)());
        case ROUTES_1.HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE:
            return ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, (0, ReportUtils_1.generateReportID)());
        case ROUTES_1.HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE:
        case ROUTES_1.HYBRID_APP_ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN:
            return ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, (0, ReportUtils_1.generateReportID)());
        default:
            return url;
    }
}
/**
 * Returns the current active route.
 */
function getActiveRoute() {
    var currentRoute = navigationRef_1.default.current && navigationRef_1.default.current.getCurrentRoute();
    if (!(currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.name)) {
        return '';
    }
    var routeFromState = (0, native_1.getPathFromState)(navigationRef_1.default.getRootState(), linkingConfig_1.linkingConfig.config);
    if (routeFromState) {
        return routeFromState;
    }
    return '';
}
/**
 * Returns the route of a report opened in RHP.
 */
function getReportRHPActiveRoute() {
    if ((0, isReportOpenInRHP_1.default)(navigationRef_1.default.getRootState())) {
        return getActiveRoute();
    }
    return '';
}
/**
 * Check whether the passed route is currently Active or not.
 *
 * Building path with getPathFromState since navigationRef.current.getCurrentRoute().path
 * is undefined in the first navigation.
 *
 * @param routePath Path to check
 * @return is active
 */
function isActiveRoute(routePath) {
    var activeRoute = getActiveRoute();
    activeRoute = activeRoute.startsWith('/') ? activeRoute.substring(1) : activeRoute;
    // We remove redundant (consecutive and trailing) slashes from path before matching
    return activeRoute === routePath.replace(CONST_1.default.REGEX.ROUTES.REDUNDANT_SLASHES, function (match, p1) { return (p1 ? '/' : ''); });
}
/**
 * Navigates to a specified route.
 * Main navigation method for redirecting to a route.
 * For detailed information about moving between screens,
 * see the NAVIGATION.md documentation.
 *
 * @param route - The route to navigate to.
 * @param options - Optional navigation options.
 * @param options.forceReplace - If true, the navigation action will replace the current route instead of pushing a new one.
 */
function navigate(route, options) {
    if (!canNavigate('navigate', { route: route })) {
        if (!navigationRef_1.default.isReady()) {
            // Store intended route if the navigator is not yet available,
            // we will try again after the NavigationContainer is ready
            Log_1.default.hmmm("[Navigation] Container not yet ready, storing route as pending: ".concat(route));
            pendingRoute = route;
        }
        return;
    }
    (0, linkTo_1.default)(navigationRef_1.default.current, route, options);
}
/**
 * When routes are compared to determine whether the fallback route passed to the goUp function is in the state,
 * these parameters shouldn't be included in the comparison.
 */
var routeParamsIgnore = ['path', 'initial', 'params', 'state', 'screen', 'policyID', 'pop'];
/**
 * @private
 * If we use destructuring, we will get an error if any of the ignored properties are not present in the object.
 */
function getRouteParamsToCompare(routeParams) {
    return (0, omit_1.default)(routeParams, routeParamsIgnore);
}
/**
 * @private
 * Private method used in goUp to determine whether a target route is present in the navigation state.
 */
function doesRouteMatchToMinimalActionPayload(route, minimalAction, compareParams) {
    if (!minimalAction.payload) {
        return false;
    }
    if (!('name' in minimalAction.payload)) {
        return false;
    }
    var areRouteNamesEqual = route.name === minimalAction.payload.name;
    if (!areRouteNamesEqual) {
        return false;
    }
    if (!compareParams) {
        return true;
    }
    if (!('params' in minimalAction.payload)) {
        return false;
    }
    var routeParams = getRouteParamsToCompare(route.params);
    var minimalActionParams = getRouteParamsToCompare(minimalAction.payload.params);
    return (0, ObjectUtils_1.shallowCompare)(routeParams, minimalActionParams);
}
/**
 * @private
 * Checks whether the given state is the root navigator state
 */
function isRootNavigatorState(state) {
    var _a;
    return state.key === ((_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState().key);
}
var defaultGoBackOptions = {
    compareParams: true,
};
/**
 * @private
 * Navigate to the given backToRoute taking into account whether it is possible to go back to this screen. Within one nested navigator, we can go back by any number
 * of screens, but if as a result of going back we would have to remove more than one screen from the rootState,
 * replace is performed so as not to lose the visited pages.
 * If backToRoute is not found in the state, replace is also called then.
 *
 * @param backToRoute - The route to go up.
 * @param options - Optional configuration that affects navigation logic, such as parameter comparison.
 */
function goUp(backToRoute, options) {
    var _a;
    if (!canNavigate('goUp', { backToRoute: backToRoute }) || !navigationRef_1.default.current) {
        Log_1.default.hmmm("[Navigation] Unable to go up. Can't navigate.");
        return;
    }
    var compareParams = (_a = options === null || options === void 0 ? void 0 : options.compareParams) !== null && _a !== void 0 ? _a : defaultGoBackOptions.compareParams;
    var rootState = navigationRef_1.default.current.getRootState();
    var stateFromPath = (0, getStateFromPath_1.default)(backToRoute);
    var action = (0, core_1.getActionFromState)(stateFromPath, linkingConfig_1.linkingConfig.config);
    if (!action) {
        Log_1.default.hmmm("[Navigation] Unable to go up. Action is undefined.");
        return;
    }
    var _b = (0, getMinimalAction_1.default)(action, rootState), minimalAction = _b.action, targetState = _b.targetState;
    if (minimalAction.type !== CONST_1.default.NAVIGATION.ACTION_TYPE.NAVIGATE || !targetState) {
        Log_1.default.hmmm('[Navigation] Unable to go up. Minimal action type is wrong.');
        return;
    }
    /**
     * In react-navigation 7 the behavior of the `navigate` function has slightly changed.
     * If it detects that a screen that we want to navigate to is already in the stack, it doesn't go back anymore.
     * More: https://reactnavigation.org/docs/upgrading-from-6.x#the-navigate-method-no-longer-goes-back-use-popto-instead
     */
    if (minimalAction.type === CONST_1.default.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        minimalAction.type = CONST_1.default.NAVIGATION.ACTION_TYPE.NAVIGATE_DEPRECATED;
    }
    var indexOfBackToRoute = targetState.routes.findLastIndex(function (route) { return doesRouteMatchToMinimalActionPayload(route, minimalAction, compareParams); });
    var distanceToPop = targetState.routes.length - indexOfBackToRoute - 1;
    // If we need to pop more than one route from rootState, we replace the current route to not lose visited routes from the navigation state
    if (indexOfBackToRoute === -1 || (isRootNavigatorState(targetState) && distanceToPop > 1)) {
        var replaceAction = __assign(__assign({}, minimalAction), { type: CONST_1.default.NAVIGATION.ACTION_TYPE.REPLACE });
        navigationRef_1.default.current.dispatch(replaceAction);
        return;
    }
    /**
     * If we are not comparing params, we want to use navigate action because it will replace params in the route already existing in the state if necessary.
     * This part will need refactor after migrating to react-navigation 7. We will use popTo instead.
     */
    if (!compareParams) {
        navigationRef_1.default.current.dispatch(minimalAction);
        return;
    }
    navigationRef_1.default.current.dispatch(__assign(__assign({}, native_1.StackActions.pop(distanceToPop)), { target: targetState.key }));
}
/**
 * Navigate back to the previous screen or a specified route.
 * For detailed information about navigation patterns and best practices,
 * see the NAVIGATION.md documentation.
 * @param backToRoute - Fallback route if pop/goBack action should, but is not possible within RHP
 * @param options - Optional configuration that affects navigation logic
 */
function goBack(backToRoute, options) {
    var _a, _b;
    if (!canNavigate('goBack', { backToRoute: backToRoute })) {
        return;
    }
    if (backToRoute) {
        goUp(backToRoute, options);
        return;
    }
    if (!((_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.canGoBack())) {
        Log_1.default.hmmm('[Navigation] Unable to go back');
        return;
    }
    (_b = navigationRef_1.default.current) === null || _b === void 0 ? void 0 : _b.goBack();
}
/**
 * Navigate back to the sidebar screen in SplitNavigator and pop all central screens from the navigator at the same time.
 * For detailed information about moving between screens,
 * see the NAVIGATION.md documentation.
 */
function popToSidebar() {
    var _a, _b, _c, _d;
    setShouldPopToSidebar(false);
    var rootState = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getRootState();
    var currentRoute = rootState === null || rootState === void 0 ? void 0 : rootState.routes.at(-1);
    if (!currentRoute) {
        Log_1.default.hmmm('[popToSidebar] Unable to pop to sidebar, no current root found in navigator');
        return;
    }
    if (!(0, isNavigatorName_1.isSplitNavigatorName)(currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.name)) {
        Log_1.default.hmmm('[popToSidebar] must be invoked only from SplitNavigator');
        return;
    }
    var topRoute = (_b = currentRoute.state) === null || _b === void 0 ? void 0 : _b.routes.at(0);
    var lastRoute = (_c = currentRoute.state) === null || _c === void 0 ? void 0 : _c.routes.at(-1);
    var currentRouteName = currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.name;
    if ((topRoute === null || topRoute === void 0 ? void 0 : topRoute.name) !== RELATIONS_1.SPLIT_TO_SIDEBAR[currentRouteName]) {
        var params = currentRoute.name === NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR ? __assign({}, lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.params) : undefined;
        var sidebarName = RELATIONS_1.SPLIT_TO_SIDEBAR[currentRouteName];
        navigationRef_1.default.dispatch({ payload: { name: sidebarName, params: params }, type: CONST_1.default.NAVIGATION.ACTION_TYPE.REPLACE });
        return;
    }
    (_d = navigationRef_1.default.current) === null || _d === void 0 ? void 0 : _d.dispatch(native_1.StackActions.popToTop());
}
/**
 * Reset the navigation state to Home page.
 */
function resetToHome() {
    var isNarrowLayout = (0, getIsNarrowLayout_1.default)();
    var rootState = navigationRef_1.default.getRootState();
    navigationRef_1.default.dispatch(__assign(__assign({}, native_1.StackActions.popToTop()), { target: rootState.key }));
    var splitNavigatorMainScreen = !isNarrowLayout
        ? {
            name: SCREENS_1.default.REPORT,
        }
        : undefined;
    var payload = (0, getInitialSplitNavigatorState_1.default)({ name: SCREENS_1.default.HOME }, splitNavigatorMainScreen);
    navigationRef_1.default.dispatch({ payload: payload, type: CONST_1.default.NAVIGATION.ACTION_TYPE.REPLACE, target: rootState.key });
}
/**
 * The goBack function doesn't support recursive pop e.g. pop route from root and then from nested navigator.
 * There is only one case where recursive pop is needed which is going back to home.
 * This function will cover this case.
 * We will implement recursive pop if more use cases will appear.
 */
function goBackToHome() {
    var isNarrowLayout = (0, getIsNarrowLayout_1.default)();
    // This set the right split navigator.
    goBack(ROUTES_1.default.HOME);
    // We want to keep the report screen in the split navigator on wide layout.
    if (!isNarrowLayout) {
        return;
    }
    // This set the right route in this split navigator.
    goBack(ROUTES_1.default.HOME);
}
/**
 * Update route params for the specified route.
 */
function setParams(params, routeKey) {
    var _a;
    if (routeKey === void 0) { routeKey = ''; }
    (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(__assign(__assign({}, native_1.CommonActions.setParams(params)), { source: routeKey }));
}
/**
 * Returns the current active route without the URL params.
 */
function getActiveRouteWithoutParams() {
    return getActiveRoute().replace(/\?.*/, '');
}
/**
 * Returns the active route name from a state event from the navigationRef.
 */
function getRouteNameFromStateEvent(event) {
    var _a;
    if (!event.data.state) {
        return;
    }
    var currentRouteName = (_a = event.data.state.routes.at(-1)) === null || _a === void 0 ? void 0 : _a.name;
    // Check to make sure we have a route name
    if (currentRouteName) {
        return currentRouteName;
    }
}
/**
 * @private
 * Navigate to the route that we originally intended to go to
 * but the NavigationContainer was not ready when navigate() was called
 */
function goToPendingRoute() {
    if (pendingRoute === null) {
        return;
    }
    Log_1.default.hmmm("[Navigation] Container now ready, going to pending route: ".concat(pendingRoute));
    navigate(pendingRoute);
    pendingRoute = null;
}
function isNavigationReady() {
    return navigationIsReadyPromise;
}
function setIsNavigationReady() {
    goToPendingRoute();
    resolveNavigationIsReadyPromise();
}
/**
 * @private
 * Checks if the navigation state contains routes that are protected (over the auth wall).
 *
 * @param state - react-navigation state object
 */
function navContainsProtectedRoutes(state) {
    if (!(state === null || state === void 0 ? void 0 : state.routeNames) || !Array.isArray(state.routeNames)) {
        return false;
    }
    // If one protected screen is in the routeNames then other screens are there as well.
    return state === null || state === void 0 ? void 0 : state.routeNames.includes(SCREENS_1.PROTECTED_SCREENS.CONCIERGE);
}
/**
 * Waits for the navigation state to contain protected routes specified in PROTECTED_SCREENS constant.
 * If the navigation is in a state, where protected routes are available, the promise resolve immediately.
 *
 * @function
 * @returns A promise that resolves when the one of the PROTECTED_SCREENS screen is available in the nav tree.
 *
 * @example
 * waitForProtectedRoutes()
 *     .then(()=> console.log('Protected routes are present!'))
 */
function waitForProtectedRoutes() {
    return new Promise(function (resolve) {
        isNavigationReady().then(function () {
            var _a, _b;
            var currentState = (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.getState();
            if (navContainsProtectedRoutes(currentState)) {
                resolve();
                return;
            }
            var unsubscribe = (_b = navigationRef_1.default.current) === null || _b === void 0 ? void 0 : _b.addListener('state', function (_a) {
                var data = _a.data;
                var state = data === null || data === void 0 ? void 0 : data.state;
                if (navContainsProtectedRoutes(state)) {
                    unsubscribe === null || unsubscribe === void 0 ? void 0 : unsubscribe();
                    resolve();
                }
            });
        });
    });
}
function getReportRouteByID(reportID, routes) {
    var _a;
    if (routes === void 0) { routes = navigationRef_1.default.getRootState().routes; }
    if (!reportID || !(routes === null || routes === void 0 ? void 0 : routes.length)) {
        return null;
    }
    for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
        var route = routes_1[_i];
        if (route.name === SCREENS_1.default.REPORT && !!route.params && 'reportID' in route.params && route.params.reportID === reportID) {
            return route;
        }
        if ((_a = route.state) === null || _a === void 0 ? void 0 : _a.routes) {
            var partialRoute = getReportRouteByID(reportID, route.state.routes);
            if (partialRoute) {
                return partialRoute;
            }
        }
    }
    return null;
}
/**
 * Closes the modal navigator (RHP, onboarding).
 * For detailed information about dismissing modals,
 * see the NAVIGATION.md documentation.
 */
var dismissModal = function (ref) {
    if (ref === void 0) { ref = navigationRef_1.default; }
    isNavigationReady().then(function () {
        ref.dispatch({ type: CONST_1.default.NAVIGATION.ACTION_TYPE.DISMISS_MODAL });
    });
};
/**
 * Dismisses the modal and opens the given report.
 * For detailed information about dismissing modals,
 * see the NAVIGATION.md documentation.
 */
var dismissModalWithReport = function (_a, ref) {
    var reportID = _a.reportID, reportActionID = _a.reportActionID, referrer = _a.referrer, moneyRequestReportActionID = _a.moneyRequestReportActionID, transactionID = _a.transactionID, backTo = _a.backTo;
    if (ref === void 0) { ref = navigationRef_1.default; }
    isNavigationReady().then(function () {
        var _a;
        var topmostReportID = getTopmostReportId();
        var areReportsIDsDefined = !!topmostReportID && !!reportID;
        var isReportsSplitTopmostFullScreen = ((_a = ref.getRootState().routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); })) === null || _a === void 0 ? void 0 : _a.name) === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR;
        if (topmostReportID === reportID && areReportsIDsDefined && isReportsSplitTopmostFullScreen) {
            dismissModal();
            return;
        }
        var reportRoute = ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID, reportActionID, referrer, moneyRequestReportActionID, transactionID, backTo);
        if ((0, getIsNarrowLayout_1.default)()) {
            navigate(reportRoute, { forceReplace: true });
            return;
        }
        dismissModal();
        react_native_1.InteractionManager.runAfterInteractions(function () {
            navigate(reportRoute);
        });
    });
};
/**
 * Returns to the first screen in the stack, dismissing all the others, only if the global variable shouldPopToSidebar is set to true.
 */
function popToTop() {
    var _a;
    if (!shouldPopToSidebar) {
        goBack();
        return;
    }
    shouldPopToSidebar = false;
    (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(native_1.StackActions.popToTop());
}
function popRootToTop() {
    var _a;
    var rootState = navigationRef_1.default.getRootState();
    (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(__assign(__assign({}, native_1.StackActions.popToTop()), { target: rootState.key }));
}
function pop(target) {
    var _a;
    (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(__assign(__assign({}, native_1.StackActions.pop()), { target: target }));
}
function removeScreenFromNavigationState(screen) {
    isNavigationReady().then(function () {
        var _a;
        (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(function (state) {
            var _a;
            var routes = (_a = state.routes) === null || _a === void 0 ? void 0 : _a.filter(function (item) { return item.name !== screen; });
            return native_1.CommonActions.reset(__assign(__assign({}, state), { routes: routes, index: routes.length < state.routes.length ? state.index - 1 : state.index }));
        });
    });
}
function isTopmostRouteModalScreen() {
    var _a, _b, _c;
    var topmostRouteName = (_c = (_b = (_a = navigationRef_1.default.getRootState()) === null || _a === void 0 ? void 0 : _a.routes) === null || _b === void 0 ? void 0 : _b.at(-1)) === null || _c === void 0 ? void 0 : _c.name;
    return (0, isSideModalNavigator_1.default)(topmostRouteName);
}
function removeScreenByKey(key) {
    isNavigationReady().then(function () {
        var _a;
        (_a = navigationRef_1.default.current) === null || _a === void 0 ? void 0 : _a.dispatch(function (state) {
            var _a;
            var routes = (_a = state.routes) === null || _a === void 0 ? void 0 : _a.filter(function (item) { return item.key !== key; });
            return native_1.CommonActions.reset(__assign(__assign({}, state), { routes: routes, index: routes.length < state.routes.length ? state.index - 1 : state.index }));
        });
    });
}
function isOnboardingFlow() {
    var state = navigationRef_1.default.getRootState();
    var currentFocusedRoute = (0, core_1.findFocusedRoute)(state);
    return (0, isNavigatorName_1.isOnboardingFlowName)(currentFocusedRoute === null || currentFocusedRoute === void 0 ? void 0 : currentFocusedRoute.name);
}
exports.default = {
    setShouldPopToSidebar: setShouldPopToSidebar,
    getShouldPopToSidebar: getShouldPopToSidebar,
    popToSidebar: popToSidebar,
    navigate: navigate,
    setParams: setParams,
    dismissModal: dismissModal,
    dismissModalWithReport: dismissModalWithReport,
    isActiveRoute: isActiveRoute,
    getActiveRoute: getActiveRoute,
    getActiveRouteWithoutParams: getActiveRouteWithoutParams,
    getReportRHPActiveRoute: getReportRHPActiveRoute,
    goBack: goBack,
    isNavigationReady: isNavigationReady,
    setIsNavigationReady: setIsNavigationReady,
    getTopmostReportId: getTopmostReportId,
    getRouteNameFromStateEvent: getRouteNameFromStateEvent,
    getTopmostReportActionId: getTopmostReportActionId,
    waitForProtectedRoutes: waitForProtectedRoutes,
    parseHybridAppUrl: parseHybridAppUrl,
    resetToHome: resetToHome,
    goBackToHome: goBackToHome,
    closeRHPFlow: closeRHPFlow,
    setNavigationActionToMicrotaskQueue: setNavigationActionToMicrotaskQueue_1.default,
    popToTop: popToTop,
    popRootToTop: popRootToTop,
    pop: pop,
    removeScreenFromNavigationState: removeScreenFromNavigationState,
    removeScreenByKey: removeScreenByKey,
    getReportRouteByID: getReportRouteByID,
    replaceWithSplitNavigator: replaceWithSplitNavigator_1.default,
    isTopmostRouteModalScreen: isTopmostRouteModalScreen,
    isOnboardingFlow: isOnboardingFlow,
};
