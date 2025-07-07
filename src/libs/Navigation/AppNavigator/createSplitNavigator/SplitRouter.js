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
var native_1 = require("@react-navigation/native");
var pick_1 = require("lodash/pick");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var getParamsFromRoute_1 = require("@libs/Navigation/helpers/getParamsFromRoute");
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var usePreserveNavigatorState_1 = require("./usePreserveNavigatorState");
var isAtLeastOneInState = function (state, screenName) { return state.routes.some(function (route) { return route.name === screenName; }); };
function getRoutePolicyID(route) {
    var _a;
    return (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.policyID;
}
/**
 * Adapts the navigation state of a SplitNavigator to ensure proper screen layout and navigation flow.
 * This function handles both narrow and wide layouts, ensuring that:
 * 1. On narrow layout, it manages sidebar visibility appropriately
 * 2. On wide layout, it ensures both sidebar and central screens are present
 * 3. Handles policy-specific navigation states
 *
 * For detailed information about SplitNavigator state adaptation and navigation patterns,
 * see the NAVIGATION.md documentation.
 *
 * @param state - The current navigation state to adapt
 * @param options - Configuration options including sidebarScreen, defaultCentralScreen, and parentRoute
 */
function adaptStateIfNecessary(_a) {
    var _b, _c, _d, _e;
    var state = _a.state, _f = _a.options, sidebarScreen = _f.sidebarScreen, defaultCentralScreen = _f.defaultCentralScreen, parentRoute = _f.parentRoute;
    var isNarrowLayout = (0, getIsNarrowLayout_1.default)();
    var rootState = navigationRef_1.default.getRootState();
    var lastRoute = state.routes.at(-1);
    var routePolicyID = getRoutePolicyID(lastRoute);
    var routes = __spreadArray([], state.routes, true);
    var modified = false;
    // If invalid policy page is displayed on narrow layout, sidebar screen should not be
    // pushed to the navigation state to avoid adding redundant not found page
    if (isNarrowLayout && !!routePolicyID) {
        if ((0, PolicyUtils_1.shouldDisplayPolicyNotFoundPage)(routePolicyID)) {
            return state; // state is unchanged
        }
    }
    // When initializing the app on a small screen with the center screen as the initial screen, the sidebar must also be split to allow users to swipe back.
    var isInitialRoute = !rootState || rootState.routes.length === 1;
    var shouldSplitHaveSidebar = isInitialRoute || !isNarrowLayout;
    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isAtLeastOneInState(state, sidebarScreen) && shouldSplitHaveSidebar) {
        var paramsFromRoute = (0, getParamsFromRoute_1.default)(sidebarScreen, !isNarrowLayout);
        var copiedParams = (0, pick_1.default)(lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.params, paramsFromRoute);
        // We don't want to get an empty object as params because it breaks some navigation logic when comparing if routes are the same.
        var params = (0, EmptyObject_1.isEmptyObject)(copiedParams) ? undefined : copiedParams;
        routes.unshift({
            name: sidebarScreen,
            // This handles the case where the sidebar should have params included in the central screen e.g. policyID for workspace initial.
            params: params,
        });
        modified = true;
    }
    // If the screen is wide, there should be at least two screens inside:
    // - sidebarScreen to cover left pane.
    // - defaultCentralScreen to cover central pane.
    if (!isNarrowLayout) {
        if (routes.length === 1 && ((_b = routes.at(0)) === null || _b === void 0 ? void 0 : _b.name) === sidebarScreen) {
            var previousSameNavigator = rootState === null || rootState === void 0 ? void 0 : rootState.routes.filter(function (route) { return route.name === parentRoute.name; }).at(-2);
            // If we have optimization for not rendering all split navigators, then last selected option may not be in the state. In this case state has to be read from the preserved state.
            var previousSameNavigatorState = (_c = previousSameNavigator === null || previousSameNavigator === void 0 ? void 0 : previousSameNavigator.state) !== null && _c !== void 0 ? _c : ((previousSameNavigator === null || previousSameNavigator === void 0 ? void 0 : previousSameNavigator.key) ? (0, usePreserveNavigatorState_1.getPreservedNavigatorState)(previousSameNavigator.key) : undefined);
            var previousSelectedCentralScreen = (previousSameNavigatorState === null || previousSameNavigatorState === void 0 ? void 0 : previousSameNavigatorState.routes) && previousSameNavigatorState.routes.length > 1 ? (_d = previousSameNavigatorState.routes.at(-1)) === null || _d === void 0 ? void 0 : _d.name : undefined;
            routes.push({
                name: previousSelectedCentralScreen !== null && previousSelectedCentralScreen !== void 0 ? previousSelectedCentralScreen : defaultCentralScreen,
                params: (_e = state.routes.at(0)) === null || _e === void 0 ? void 0 : _e.params,
            });
            modified = true;
        }
    }
    if (!modified) {
        return state;
    }
    return __assign(__assign({}, state), { routes: routes, stale: true, index: routes.length - 1 });
}
function isPushingSidebarOnCentralPane(state, action, options) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.PUSH && action.payload.name === options.sidebarScreen && state.routes.length > 1;
}
function SplitRouter(options) {
    var stackRouter = (0, native_1.StackRouter)(options);
    return __assign(__assign({}, stackRouter), { getStateForAction: function (state, action, configOptions) {
            if (isPushingSidebarOnCentralPane(state, action, options)) {
                if ((0, getIsNarrowLayout_1.default)()) {
                    var newAction = native_1.StackActions.popToTop();
                    return stackRouter.getStateForAction(state, newAction, configOptions);
                }
                // On wide screen do nothing as we want to keep the central pane screen and the sidebar is visible.
                return state;
            }
            return stackRouter.getStateForAction(state, action, configOptions);
        }, getInitialState: function (_a) {
            var _b;
            var routeNames = _a.routeNames, routeParamList = _a.routeParamList, routeGetIdList = _a.routeGetIdList;
            var initialState = (_b = (0, usePreserveNavigatorState_1.getPreservedNavigatorState)(options.parentRoute.key)) !== null && _b !== void 0 ? _b : stackRouter.getInitialState({ routeNames: routeNames, routeParamList: routeParamList, routeGetIdList: routeGetIdList });
            var maybeAdaptedState = adaptStateIfNecessary({ state: initialState, options: options });
            // If we needed to modify the state we need to rehydrate it to get keys for new routes.
            if (maybeAdaptedState.stale) {
                return stackRouter.getRehydratedState(maybeAdaptedState, { routeNames: routeNames, routeParamList: routeParamList, routeGetIdList: routeGetIdList });
            }
            return maybeAdaptedState;
        }, getRehydratedState: function (partialState, _a) {
            var routeNames = _a.routeNames, routeParamList = _a.routeParamList, routeGetIdList = _a.routeGetIdList;
            var adaptedState = adaptStateIfNecessary({ state: partialState, options: options });
            return stackRouter.getRehydratedState(adaptedState, { routeNames: routeNames, routeParamList: routeParamList, routeGetIdList: routeGetIdList });
        } });
}
exports.default = SplitRouter;
