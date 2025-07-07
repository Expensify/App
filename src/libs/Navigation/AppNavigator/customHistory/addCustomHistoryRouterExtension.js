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
var CONST_1 = require("@src/CONST");
var SCREEN_TO_HISTORY_PARAM_1 = require("@src/libs/Navigation/linkingConfig/RELATIONS/SCREEN_TO_HISTORY_PARAM");
var CUSTOM_HISTORY_PREFIX = 'CUSTOM_HISTORY';
function isSetParamsAction(action) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.SET_PARAMS;
}
function isSetHistoryParamAction(action) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.SET_HISTORY_PARAM;
}
// The history can be anything. For now, string is enough but we can extend it to include more data if necessary.
function getCustomHistoryEntry(routeName) {
    return "".concat(CUSTOM_HISTORY_PREFIX, "-").concat(routeName);
}
/**
 * Higher-order function that extends the React Navigation stack router with custom history functionality.
 * It allows tracking and managing navigation history entries that are not determined by the routes of navigator.
 * The extension adds support for custom history entries through route params and maintains a history stack
 * that can be manipulated independently of the navigation state.
 *
 * @param originalStackRouter - The original stack router function to be extended
 * @returns Enhanced router with custom history functionality
 */
function addCustomHistoryRouterExtension(originalRouter) {
    return function (options) {
        var router = originalRouter(options);
        var enhanceStateWithHistory = function (state) {
            return __assign(__assign({}, state), { history: state.routes.map(function (route) { return route.key; }) });
        };
        // Override methods to enhance state with history
        var getInitialState = function (configOptions) {
            var state = router.getInitialState(configOptions);
            return enhanceStateWithHistory(state);
        };
        var getRehydratedState = function (partialState, configOptions) {
            var state = router.getRehydratedState(partialState, configOptions);
            var stateWithInitialHistory = enhanceStateWithHistory(state);
            var focusedRoute = (0, native_1.findFocusedRoute)(stateWithInitialHistory);
            // There always be a focused route in the state. It's for type safety.
            if (!focusedRoute) {
                return stateWithInitialHistory;
            }
            // @ts-expect-error focusedRoute.key is always defined because it is a route from a rehydrated state. Find focused route isn't correctly typed in this case.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            var customHistoryEntry = getCustomHistoryEntry(focusedRoute.key);
            var customHistoryParamName = SCREEN_TO_HISTORY_PARAM_1.default[focusedRoute.name];
            if (
            // The custom history param name should be defined
            typeof customHistoryParamName === 'string' &&
                // Params for the focused route should be defined
                focusedRoute.params &&
                // The custom history param with given name should be defined in the params
                customHistoryParamName in focusedRoute.params &&
                // The custom history param should be set to true
                focusedRoute.params[customHistoryParamName] &&
                // The last history entry should not be the custom history entry for the focused route to avoid duplication
                stateWithInitialHistory.history.at(-1) !== customHistoryEntry) {
                // Add the custom history entry to the initial history
                stateWithInitialHistory.history = __spreadArray(__spreadArray([], stateWithInitialHistory.history, true), [customHistoryEntry], false);
            }
            return stateWithInitialHistory;
        };
        var getStateForAction = function (state, action, configOptions) {
            var _a;
            // We want to set the right param and then update the history
            if (isSetHistoryParamAction(action)) {
                var customHistoryEntry_1 = getCustomHistoryEntry(action.payload.key);
                // Start with updating the param.
                var setParamsAction = native_1.CommonActions.setParams((_a = {}, _a[action.payload.key] = action.payload.value, _a));
                var stateWithUpdatedParams = router.getStateForAction(state, setParamsAction, configOptions);
                // This shouldn't ever happen as the history should be always defined. It's for type safety.
                if (!(stateWithUpdatedParams === null || stateWithUpdatedParams === void 0 ? void 0 : stateWithUpdatedParams.history)) {
                    return stateWithUpdatedParams;
                }
                // If it's set to true, we need to add the history entry if it's not already there.
                if (action.payload.value && stateWithUpdatedParams.history.at(-1) !== customHistoryEntry_1) {
                    return __assign(__assign({}, stateWithUpdatedParams), { history: __spreadArray(__spreadArray([], stateWithUpdatedParams.history, true), [customHistoryEntry_1], false) });
                }
                // If it's set to false, we need to remove the history entry if it's there.
                if (!action.payload.value) {
                    return __assign(__assign({}, stateWithUpdatedParams), { history: stateWithUpdatedParams.history.filter(function (entry) { return entry !== customHistoryEntry_1; }) });
                }
                // Else, do not change history.
                return stateWithUpdatedParams;
            }
            var newState = router.getStateForAction(state, action, configOptions);
            // If the action was not handled, return null.
            if (!newState) {
                return null;
            }
            // If the action was a setParams action, we need to preserve the history.
            if (isSetParamsAction(action) && state.history) {
                return __assign(__assign({}, newState), { history: __spreadArray([], state.history, true) });
            }
            // Handle every other action.
            // @ts-expect-error newState can be partial or not. But getRehydratedState will handle it correctly even if the stale === false.
            // And we need to update the history if routes have changed.
            return getRehydratedState(newState, configOptions);
        };
        return __assign(__assign({}, router), { getInitialState: getInitialState, getRehydratedState: getRehydratedState, getStateForAction: getStateForAction });
    };
}
exports.default = addCustomHistoryRouterExtension;
