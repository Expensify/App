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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFullScreenName = void 0;
exports.getMatchingFullScreenRoute = getMatchingFullScreenRoute;
var native_1 = require("@react-navigation/native");
var pick_1 = require("lodash/pick");
var react_native_onyx_1 = require("react-native-onyx");
var getInitialSplitNavigatorState_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState");
var config_1 = require("@libs/Navigation/linkingConfig/config");
var RELATIONS_1 = require("@libs/Navigation/linkingConfig/RELATIONS");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var getMatchingNewRoute_1 = require("./getMatchingNewRoute");
var getParamsFromRoute_1 = require("./getParamsFromRoute");
var isNavigatorName_1 = require("./isNavigatorName");
Object.defineProperty(exports, "isFullScreenName", { enumerable: true, get: function () { return isNavigatorName_1.isFullScreenName; } });
var replacePathInNestedState_1 = require("./replacePathInNestedState");
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
// The function getPathFromState that we are using in some places isn't working correctly without defined index.
var getRoutesWithIndex = function (routes) { return ({ routes: routes, index: routes.length - 1 }); };
function isRouteWithBackToParam(route) {
    return route.params !== undefined && 'backTo' in route.params && typeof route.params.backTo === 'string';
}
function isRouteWithReportID(route) {
    return route.params !== undefined && 'reportID' in route.params && typeof route.params.reportID === 'string';
}
function getMatchingFullScreenRoute(route) {
    // Check for backTo param. One screen with different backTo value may need different screens visible under the overlay.
    if (isRouteWithBackToParam(route)) {
        var stateForBackTo = (0, native_1.getStateFromPath)(route.params.backTo, config_1.config);
        // This may happen if the backTo url is invalid.
        var lastRoute = stateForBackTo === null || stateForBackTo === void 0 ? void 0 : stateForBackTo.routes.at(-1);
        if (!stateForBackTo || !lastRoute || lastRoute.name === SCREENS_1.default.NOT_FOUND) {
            return undefined;
        }
        var isLastRouteFullScreen = (0, isNavigatorName_1.isFullScreenName)(lastRoute.name);
        // If the state for back to last route is a full screen route, we can use it
        if (isLastRouteFullScreen) {
            return lastRoute;
        }
        var focusedStateForBackToRoute = (0, native_1.findFocusedRoute)(stateForBackTo);
        if (!focusedStateForBackToRoute) {
            return undefined;
        }
        // If not, get the matching full screen route for the back to state.
        return getMatchingFullScreenRoute(focusedStateForBackToRoute);
    }
    if (RELATIONS_1.RHP_TO_SEARCH[route.name]) {
        var paramsFromRoute = (0, getParamsFromRoute_1.default)(RELATIONS_1.RHP_TO_SEARCH[route.name]);
        var searchRoute = {
            name: RELATIONS_1.RHP_TO_SEARCH[route.name],
            params: paramsFromRoute.length > 0 ? (0, pick_1.default)(route.params, paramsFromRoute) : undefined,
        };
        return {
            name: NAVIGATORS_1.default.SEARCH_FULLSCREEN_NAVIGATOR,
            state: getRoutesWithIndex([searchRoute]),
        };
    }
    if (RELATIONS_1.RHP_TO_SIDEBAR[route.name]) {
        return (0, getInitialSplitNavigatorState_1.default)({
            name: RELATIONS_1.RHP_TO_SIDEBAR[route.name],
        });
    }
    if (RELATIONS_1.RHP_TO_WORKSPACE[route.name]) {
        var paramsFromRoute = (0, getParamsFromRoute_1.default)(RELATIONS_1.RHP_TO_WORKSPACE[route.name]);
        return (0, getInitialSplitNavigatorState_1.default)({
            name: SCREENS_1.default.WORKSPACE.INITIAL,
            params: paramsFromRoute.length > 0 ? (0, pick_1.default)(route.params, paramsFromRoute) : undefined,
        }, {
            name: RELATIONS_1.RHP_TO_WORKSPACE[route.name],
            params: paramsFromRoute.length > 0 ? (0, pick_1.default)(route.params, paramsFromRoute) : undefined,
        });
    }
    if (RELATIONS_1.RHP_TO_SETTINGS[route.name]) {
        var paramsFromRoute = (0, getParamsFromRoute_1.default)(RELATIONS_1.RHP_TO_SETTINGS[route.name]);
        return (0, getInitialSplitNavigatorState_1.default)({
            name: SCREENS_1.default.SETTINGS.ROOT,
        }, {
            name: RELATIONS_1.RHP_TO_SETTINGS[route.name],
            params: paramsFromRoute.length > 0 ? (0, pick_1.default)(route.params, paramsFromRoute) : undefined,
        });
    }
    return undefined;
}
// If there is no particular matching route defined, we want to get the default route.
// It is the reports split navigator with report. If the reportID is defined in the focused route, we want to use it for the default report.
// This is separated from getMatchingFullScreenRoute because we want to use it only for the initial state.
// We don't want to make this route mandatory e.g. after deep linking or opening a specific flow.
function getDefaultFullScreenRoute(route) {
    var _a;
    // We will use it if the reportID is not defined. Router of this navigator has logic to fill it with a report.
    var fallbackRoute = {
        name: NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR,
    };
    if (route && isRouteWithReportID(route)) {
        var reportID = route.params.reportID;
        if (!((_a = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)]) === null || _a === void 0 ? void 0 : _a.reportID)) {
            return fallbackRoute;
        }
        return (0, getInitialSplitNavigatorState_1.default)({
            name: SCREENS_1.default.HOME,
        }, {
            name: SCREENS_1.default.REPORT,
            params: { reportID: reportID },
        });
    }
    return fallbackRoute;
}
function getOnboardingAdaptedState(state) {
    var onboardingRoute = state.routes.at(0);
    if (!onboardingRoute || onboardingRoute.name === SCREENS_1.default.ONBOARDING.PURPOSE || onboardingRoute.name === SCREENS_1.default.ONBOARDING.WORK_EMAIL) {
        return state;
    }
    var routes = [];
    routes.push({ name: onboardingRoute.name === SCREENS_1.default.ONBOARDING.WORKSPACES ? SCREENS_1.default.ONBOARDING.PERSONAL_DETAILS : SCREENS_1.default.ONBOARDING.PURPOSE });
    if (onboardingRoute.name === SCREENS_1.default.ONBOARDING.ACCOUNTING) {
        routes.push({ name: SCREENS_1.default.ONBOARDING.EMPLOYEES });
    }
    routes.push(onboardingRoute);
    return getRoutesWithIndex(routes);
}
function getAdaptedState(state) {
    var fullScreenRoute = state.routes.find(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); });
    var onboardingNavigator = state.routes.find(function (route) { return route.name === NAVIGATORS_1.default.ONBOARDING_MODAL_NAVIGATOR; });
    var isWorkspaceSplitNavigator = (fullScreenRoute === null || fullScreenRoute === void 0 ? void 0 : fullScreenRoute.name) === NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR;
    if (isWorkspaceSplitNavigator) {
        var workspacesListRoute = { name: SCREENS_1.default.WORKSPACES_LIST };
        return getRoutesWithIndex(__spreadArray([workspacesListRoute], state.routes, true));
    }
    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        var focusedRoute = (0, native_1.findFocusedRoute)(state);
        if (focusedRoute) {
            var matchingRootRoute = getMatchingFullScreenRoute(focusedRoute);
            // If there is a matching root route, add it to the state.
            if (matchingRootRoute) {
                var routes = __spreadArray([matchingRootRoute], state.routes, true);
                if (matchingRootRoute.name === NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR) {
                    var workspacesListRoute = { name: SCREENS_1.default.WORKSPACES_LIST };
                    routes.unshift(workspacesListRoute);
                }
                return getRoutesWithIndex(routes);
            }
        }
        var defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute);
        // The onboarding flow consists of several screens. If we open any of the screens, the previous screens from that flow should be in the state.
        if (onboardingNavigator === null || onboardingNavigator === void 0 ? void 0 : onboardingNavigator.state) {
            var adaptedOnboardingNavigator = __assign(__assign({}, onboardingNavigator), { state: getOnboardingAdaptedState(onboardingNavigator.state) });
            return getRoutesWithIndex([defaultFullScreenRoute, adaptedOnboardingNavigator]);
        }
        // If not, add the default full screen route.
        return getRoutesWithIndex(__spreadArray([defaultFullScreenRoute], state.routes, true));
    }
    return state;
}
/**
 * Generate a navigation state from a given path, adapting it to handle cases like onboarding flow,
 * displaying RHP screens and navigating in the Workspaces tab.
 * For detailed information about generating state from a path,
 * see the NAVIGATION.md documentation.
 *
 * @param path - The path to generate state from
 * @param options - Extra options to fine-tune how to parse the path
 * @param shouldReplacePathInNestedState - Whether to replace the path in nested state
 * @returns The adapted navigation state
 * @throws Error if unable to get state from path
 */
var getAdaptedStateFromPath = function (path, options, shouldReplacePathInNestedState) {
    var _a;
    if (shouldReplacePathInNestedState === void 0) { shouldReplacePathInNestedState = true; }
    var normalizedPath = !path.startsWith('/') ? "/".concat(path) : path;
    normalizedPath = (_a = (0, getMatchingNewRoute_1.default)(normalizedPath)) !== null && _a !== void 0 ? _a : normalizedPath;
    // Bing search results still link to /signin when searching for “Expensify”, but the /signin route no longer exists in our repo, so we redirect it to the home page to avoid showing a Not Found page.
    if (normalizedPath === CONST_1.default.SIGNIN_ROUTE) {
        normalizedPath = '/';
    }
    var state = (0, native_1.getStateFromPath)(normalizedPath, options);
    if (shouldReplacePathInNestedState) {
        (0, replacePathInNestedState_1.default)(state, normalizedPath);
    }
    if (state === undefined) {
        throw new Error("[getAdaptedStateFromPath] Unable to get state from path: ".concat(path));
    }
    return getAdaptedState(state);
};
exports.default = getAdaptedStateFromPath;
