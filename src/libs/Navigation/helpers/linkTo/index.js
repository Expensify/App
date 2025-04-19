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
exports.__esModule = true;
var core_1 = require('@react-navigation/core');
var native_1 = require('@react-navigation/native');
var getAdaptedStateFromPath_1 = require('@libs/Navigation/helpers/getAdaptedStateFromPath');
var getStateFromPath_1 = require('@libs/Navigation/helpers/getStateFromPath');
var normalizePath_1 = require('@libs/Navigation/helpers/normalizePath');
var linkingConfig_1 = require('@libs/Navigation/linkingConfig');
var ObjectUtils_1 = require('@libs/ObjectUtils');
var PolicyUtils_1 = require('@libs/PolicyUtils');
var CONST_1 = require('@src/CONST');
var NAVIGATORS_1 = require('@src/NAVIGATORS');
var SCREENS_1 = require('@src/SCREENS');
var getMinimalAction_1 = require('./getMinimalAction');
var defaultLinkToOptions = {
    forceReplace: false,
};
function createActionWithPolicyID(action, policyID) {
    if (action.type !== 'PUSH' && action.type !== 'REPLACE') {
        return;
    }
    return __assign(__assign({}, action), {payload: __assign(__assign({}, action.payload), {params: __assign(__assign({}, action.payload.params), {policyID: policyID})})});
}
function areNamesAndParamsEqual(currentState, stateFromPath) {
    var currentFocusedRoute = native_1.findFocusedRoute(currentState);
    var targetFocusedRoute = native_1.findFocusedRoute(stateFromPath);
    var areNamesEqual =
        (currentFocusedRoute === null || currentFocusedRoute === void 0 ? void 0 : currentFocusedRoute.name) ===
        (targetFocusedRoute === null || targetFocusedRoute === void 0 ? void 0 : targetFocusedRoute.name);
    var areParamsEqual = ObjectUtils_1.shallowCompare(
        currentFocusedRoute === null || currentFocusedRoute === void 0 ? void 0 : currentFocusedRoute.params,
        targetFocusedRoute === null || targetFocusedRoute === void 0 ? void 0 : targetFocusedRoute.params,
    );
    return areNamesEqual && areParamsEqual;
}
function shouldCheckFullScreenRouteMatching(action) {
    return action !== undefined && action.type === 'PUSH' && action.payload.name === NAVIGATORS_1['default'].RIGHT_MODAL_NAVIGATOR;
}
function isNavigatingToAttachmentScreen(focusedRouteName) {
    return focusedRouteName === SCREENS_1['default'].ATTACHMENTS;
}
function isNavigatingToReportWithSameReportID(currentRoute, newRoute) {
    if (currentRoute.name !== SCREENS_1['default'].REPORT || newRoute.name !== SCREENS_1['default'].REPORT) {
        return false;
    }
    var currentParams = currentRoute.params;
    var newParams = newRoute === null || newRoute === void 0 ? void 0 : newRoute.params;
    return (currentParams === null || currentParams === void 0 ? void 0 : currentParams.reportID) === (newParams === null || newParams === void 0 ? void 0 : newParams.reportID);
}
function linkTo(navigation, path, options) {
    var _a, _b;
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }
    // We know that the options are always defined because we have default options.
    var forceReplace = __assign(__assign({}, defaultLinkToOptions), options).forceReplace;
    var normalizedPath = normalizePath_1['default'](path);
    var extractedPolicyID = PolicyUtils_1.extractPolicyIDFromPath(normalizedPath);
    var pathWithoutPolicyID = PolicyUtils_1.getPathWithoutPolicyID(normalizedPath);
    // This is the state generated with the default getStateFromPath function.
    // It won't include the whole state that will be generated for this path but the focused route will be correct.
    // It is necessary because getActionFromState will generate RESET action for whole state generated with our custom getStateFromPath function.
    var stateFromPath = getStateFromPath_1['default'](pathWithoutPolicyID);
    var currentState = navigation.getRootState();
    var focusedRouteFromPath = native_1.findFocusedRoute(stateFromPath);
    var currentFocusedRoute = native_1.findFocusedRoute(currentState);
    // For type safety. It shouldn't ever happen.
    if (!focusedRouteFromPath || !currentFocusedRoute) {
        return;
    }
    var action = core_1.getActionFromState(stateFromPath, linkingConfig_1.linkingConfig.config);
    // If there is no action, just reset the whole state.
    if (!action) {
        navigation.resetRoot(stateFromPath);
        return;
    }
    // We don't want to dispatch action to push/replace with exactly the same route that is already focused.
    if (areNamesAndParamsEqual(currentState, stateFromPath)) {
        return;
    }
    if (forceReplace) {
        action.type = CONST_1['default'].NAVIGATION.ACTION_TYPE.REPLACE;
    }
    // Attachment screen - This is a special case. We want to navigate to it instead of push. If there is no screen on the stack, it will be pushed.
    // If not, it will be replaced. This way, navigating between one attachment screen and another won't be added to the browser history.
    // Report screen - Also a special case. If we are navigating to the report with same reportID we want to replace it (navigate will do that).
    // This covers the case when we open a specific message in report (reportActionID).
    else if (
        action.type === CONST_1['default'].NAVIGATION.ACTION_TYPE.NAVIGATE &&
        !isNavigatingToAttachmentScreen(focusedRouteFromPath === null || focusedRouteFromPath === void 0 ? void 0 : focusedRouteFromPath.name) &&
        !isNavigatingToReportWithSameReportID(currentFocusedRoute, focusedRouteFromPath)
    ) {
        // We want to PUSH by default to add entries to the browser history.
        action.type = CONST_1['default'].NAVIGATION.ACTION_TYPE.PUSH;
    }
    // Handle deep links including policyID as /w/:policyID.
    if (extractedPolicyID) {
        var actionWithPolicyID = createActionWithPolicyID(action, extractedPolicyID);
        if (!actionWithPolicyID) {
            return;
        }
        navigation.dispatch(actionWithPolicyID);
        return;
    }
    // If we deep link to a RHP page, we want to make sure we have the correct full screen route under the overlay.
    if (shouldCheckFullScreenRouteMatching(action)) {
        var newFocusedRoute = native_1.findFocusedRoute(stateFromPath);
        if (newFocusedRoute) {
            var matchingFullScreenRoute = getAdaptedStateFromPath_1.getMatchingFullScreenRoute(newFocusedRoute);
            var lastFullScreenRoute = currentState.routes.findLast(function (route) {
                return getAdaptedStateFromPath_1.isFullScreenName(route.name);
            });
            if (matchingFullScreenRoute && lastFullScreenRoute && matchingFullScreenRoute.name !== lastFullScreenRoute.name) {
                var lastRouteInMatchingFullScreen = (_b = (_a = matchingFullScreenRoute.state) === null || _a === void 0 ? void 0 : _a.routes) === null || _b === void 0 ? void 0 : _b.at(-1);
                var additionalAction = native_1.StackActions.push(matchingFullScreenRoute.name, {
                    screen: lastRouteInMatchingFullScreen === null || lastRouteInMatchingFullScreen === void 0 ? void 0 : lastRouteInMatchingFullScreen.name,
                    params: lastRouteInMatchingFullScreen === null || lastRouteInMatchingFullScreen === void 0 ? void 0 : lastRouteInMatchingFullScreen.params,
                });
                navigation.dispatch(additionalAction);
            }
        }
    }
    var minimalAction = getMinimalAction_1['default'](action, navigation.getRootState()).action;
    navigation.dispatch(minimalAction);
}
exports['default'] = linkTo;
