'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.isFullScreenName = exports.getMatchingFullScreenRoute = void 0;
var native_1 = require('@react-navigation/native');
var pick_1 = require('lodash/pick');
var react_native_onyx_1 = require('react-native-onyx');
var Session_1 = require('@libs/actions/Session');
var getInitialSplitNavigatorState_1 = require('@libs/Navigation/AppNavigator/createSplitNavigator/getInitialSplitNavigatorState');
var config_1 = require('@libs/Navigation/linkingConfig/config');
var RELATIONS_1 = require('@libs/Navigation/linkingConfig/RELATIONS');
var PolicyUtils_1 = require('@libs/PolicyUtils');
var NAVIGATORS_1 = require('@src/NAVIGATORS');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var SCREENS_1 = require('@src/SCREENS');
var extractPolicyIDFromQuery_1 = require('./extractPolicyIDFromQuery');
var getParamsFromRoute_1 = require('./getParamsFromRoute');
var isNavigatorName_1 = require('./isNavigatorName');
exports.isFullScreenName = isNavigatorName_1.isFullScreenName;
var replacePathInNestedState_1 = require('./replacePathInNestedState');
var allReports;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
// The function getPathFromState that we are using in some places isn't working correctly without defined index.
var getRoutesWithIndex = function (routes) {
    return {routes: routes, index: routes.length - 1};
};
function isRouteWithBackToParam(route) {
    return route.params !== undefined && 'backTo' in route.params && typeof route.params.backTo === 'string';
}
function isRouteWithReportID(route) {
    return route.params !== undefined && 'reportID' in route.params && typeof route.params.reportID === 'string';
}
function getMatchingFullScreenRoute(route, policyID) {
    // Check for backTo param. One screen with different backTo value may need different screens visible under the overlay.
    if (isRouteWithBackToParam(route)) {
        var stateForBackTo = native_1.getStateFromPath(route.params.backTo, config_1.config);
        // This may happen if the backTo url is invalid.
        var lastRoute = stateForBackTo === null || stateForBackTo === void 0 ? void 0 : stateForBackTo.routes.at(-1);
        if (!stateForBackTo || !lastRoute || lastRoute.name === SCREENS_1['default'].NOT_FOUND) {
            return undefined;
        }
        var isLastRouteFullScreen = isNavigatorName_1.isFullScreenName(lastRoute.name);
        // If the state for back to last route is a full screen route, we can use it
        if (isLastRouteFullScreen) {
            return lastRoute;
        }
        var focusedStateForBackToRoute = native_1.findFocusedRoute(stateForBackTo);
        if (!focusedStateForBackToRoute) {
            return undefined;
        }
        // If not, get the matching full screen route for the back to state.
        return getMatchingFullScreenRoute(focusedStateForBackToRoute, policyID);
    }
    if (RELATIONS_1.SEARCH_TO_RHP.includes(route.name)) {
        var paramsFromRoute = getParamsFromRoute_1['default'](SCREENS_1['default'].SEARCH.ROOT);
        return {
            name: NAVIGATORS_1['default'].SEARCH_FULLSCREEN_NAVIGATOR,
            params: paramsFromRoute.length > 0 ? pick_1['default'](route.params, paramsFromRoute) : undefined,
        };
    }
    if (RELATIONS_1.RHP_TO_SIDEBAR[route.name]) {
        return getInitialSplitNavigatorState_1['default'](
            {
                name: RELATIONS_1.RHP_TO_SIDEBAR[route.name],
            },
            undefined,
            policyID ? {policyID: policyID} : undefined,
        );
    }
    if (RELATIONS_1.RHP_TO_WORKSPACE[route.name]) {
        var paramsFromRoute = getParamsFromRoute_1['default'](RELATIONS_1.RHP_TO_WORKSPACE[route.name]);
        return getInitialSplitNavigatorState_1['default'](
            {
                name: SCREENS_1['default'].WORKSPACE.INITIAL,
                params: paramsFromRoute.length > 0 ? pick_1['default'](route.params, paramsFromRoute) : undefined,
            },
            {
                name: RELATIONS_1.RHP_TO_WORKSPACE[route.name],
                params: paramsFromRoute.length > 0 ? pick_1['default'](route.params, paramsFromRoute) : undefined,
            },
        );
    }
    if (RELATIONS_1.RHP_TO_SETTINGS[route.name]) {
        var paramsFromRoute = getParamsFromRoute_1['default'](RELATIONS_1.RHP_TO_SETTINGS[route.name]);
        return getInitialSplitNavigatorState_1['default'](
            {
                name: SCREENS_1['default'].SETTINGS.ROOT,
            },
            {
                name: RELATIONS_1.RHP_TO_SETTINGS[route.name],
                params: paramsFromRoute.length > 0 ? pick_1['default'](route.params, paramsFromRoute) : undefined,
            },
        );
    }
    return undefined;
}
exports.getMatchingFullScreenRoute = getMatchingFullScreenRoute;
// If there is no particular matching route defined, we want to get the default route.
// It is the reports split navigator with report. If the reportID is defined in the focused route, we want to use it for the default report.
// This is separated from getMatchingFullScreenRoute because we want to use it only for the initial state.
// We don't want to make this route mandatory e.g. after deep linking or opening a specific flow.
function getDefaultFullScreenRoute(route, policyID) {
    var _a;
    // We will use it if the reportID is not defined. Router of this navigator has logic to fill it with a report.
    var fallbackRoute = {
        name: NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR,
        params: policyID ? {policyID: policyID} : undefined,
    };
    if (route && isRouteWithReportID(route)) {
        var reportID = route.params.reportID;
        if (
            !((_a = allReports === null || allReports === void 0 ? void 0 : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + reportID]) === null || _a === void 0
                ? void 0
                : _a.reportID)
        ) {
            return fallbackRoute;
        }
        return getInitialSplitNavigatorState_1['default'](
            {
                name: SCREENS_1['default'].HOME,
            },
            {
                name: SCREENS_1['default'].REPORT,
                params: {reportID: reportID},
            },
            policyID ? {policyID: policyID} : undefined,
        );
    }
    return fallbackRoute;
}
function getOnboardingAdaptedState(state) {
    var onboardingRoute = state.routes.at(0);
    if (!onboardingRoute || onboardingRoute.name === SCREENS_1['default'].ONBOARDING.PURPOSE) {
        return state;
    }
    var routes = [];
    routes.push({name: SCREENS_1['default'].ONBOARDING.PURPOSE});
    if (onboardingRoute.name === SCREENS_1['default'].ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS_1['default'].ONBOARDING.EMPLOYEES});
    }
    routes.push(onboardingRoute);
    return getRoutesWithIndex(routes);
}
function getAdaptedState(state, policyID) {
    var fullScreenRoute = state.routes.find(function (route) {
        return isNavigatorName_1.isFullScreenName(route.name);
    });
    var onboardingNavigator = state.routes.find(function (route) {
        return route.name === NAVIGATORS_1['default'].ONBOARDING_MODAL_NAVIGATOR;
    });
    var isReportSplitNavigator = (fullScreenRoute === null || fullScreenRoute === void 0 ? void 0 : fullScreenRoute.name) === NAVIGATORS_1['default'].REPORTS_SPLIT_NAVIGATOR;
    var isWorkspaceSplitNavigator = (fullScreenRoute === null || fullScreenRoute === void 0 ? void 0 : fullScreenRoute.name) === NAVIGATORS_1['default'].WORKSPACE_SPLIT_NAVIGATOR;
    // If policyID is defined, it should be passed to the reportNavigator params.
    if (isReportSplitNavigator && policyID) {
        var routes = [];
        var reportNavigatorWithPolicyID = __assign({}, fullScreenRoute);
        reportNavigatorWithPolicyID.params = __assign(__assign({}, reportNavigatorWithPolicyID.params), {policyID: policyID});
        routes.push(reportNavigatorWithPolicyID);
        return getRoutesWithIndex(routes);
    }
    if (isWorkspaceSplitNavigator) {
        var settingsSplitRoute = getInitialSplitNavigatorState_1['default']({name: SCREENS_1['default'].SETTINGS.ROOT}, {name: SCREENS_1['default'].SETTINGS.WORKSPACES});
        return getRoutesWithIndex(__spreadArrays([settingsSplitRoute], state.routes));
    }
    // If there is no full screen route in the root, we want to add it.
    if (!fullScreenRoute) {
        var focusedRoute = native_1.findFocusedRoute(state);
        if (focusedRoute) {
            var matchingRootRoute = getMatchingFullScreenRoute(focusedRoute, policyID);
            // If there is a matching root route, add it to the state.
            if (matchingRootRoute) {
                var routes = __spreadArrays([matchingRootRoute], state.routes);
                if (matchingRootRoute.name === NAVIGATORS_1['default'].WORKSPACE_SPLIT_NAVIGATOR) {
                    var settingsSplitRoute = getInitialSplitNavigatorState_1['default']({name: SCREENS_1['default'].SETTINGS.ROOT}, {name: SCREENS_1['default'].SETTINGS.WORKSPACES});
                    routes.unshift(settingsSplitRoute);
                }
                return getRoutesWithIndex(routes);
            }
        }
        var defaultFullScreenRoute = getDefaultFullScreenRoute(focusedRoute, policyID);
        // The onboarding flow consists of several screens. If we open any of the screens, the previous screens from that flow should be in the state.
        if (onboardingNavigator === null || onboardingNavigator === void 0 ? void 0 : onboardingNavigator.state) {
            var adaptedOnboardingNavigator = __assign(__assign({}, onboardingNavigator), {state: getOnboardingAdaptedState(onboardingNavigator.state)});
            return getRoutesWithIndex([defaultFullScreenRoute, adaptedOnboardingNavigator]);
        }
        // If not, add the default full screen route.
        return getRoutesWithIndex(__spreadArrays([defaultFullScreenRoute], state.routes));
    }
    return state;
}
var getAdaptedStateFromPath = function (path, options, shouldReplacePathInNestedState) {
    if (shouldReplacePathInNestedState === void 0) {
        shouldReplacePathInNestedState = true;
    }
    var normalizedPath = !path.startsWith('/') ? '/' + path : path;
    var pathWithoutPolicyID = PolicyUtils_1.getPathWithoutPolicyID(normalizedPath);
    var isAnonymous = Session_1.isAnonymousUser();
    // Anonymous users don't have access to workspaces
    var policyID = isAnonymous ? undefined : PolicyUtils_1.extractPolicyIDFromPath(path);
    var state = native_1.getStateFromPath(pathWithoutPolicyID, options);
    if (shouldReplacePathInNestedState) {
        replacePathInNestedState_1['default'](state, normalizedPath);
    }
    if (state === undefined) {
        throw new Error('[getAdaptedStateFromPath] Unable to get state from path: ' + path);
    }
    // On SCREENS.SEARCH.ROOT policyID is stored differently inside search query ("q" param), so we're handling this case
    var focusedRoute = native_1.findFocusedRoute(state);
    var policyIDFromQuery = extractPolicyIDFromQuery_1['default'](focusedRoute);
    return getAdaptedState(state, policyID !== null && policyID !== void 0 ? policyID : policyIDFromQuery);
};
exports['default'] = getAdaptedStateFromPath;
