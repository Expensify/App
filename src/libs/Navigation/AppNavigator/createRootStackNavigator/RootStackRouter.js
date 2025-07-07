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
var Localize = require("@libs/Localize");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var isSideModalNavigator_1 = require("@libs/Navigation/helpers/isSideModalNavigator");
var Welcome = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var GetStateForActionHandlers_1 = require("./GetStateForActionHandlers");
var syncBrowserHistory_1 = require("./syncBrowserHistory");
function isOpenWorkspaceSplitAction(action) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT;
}
function isPushAction(action) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.PUSH;
}
function isReplaceAction(action) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.REPLACE;
}
function isDismissModalAction(action) {
    return action.type === CONST_1.default.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;
}
function shouldPreventReset(state, action) {
    if (action.type !== CONST_1.default.NAVIGATION_ACTIONS.RESET || !(action === null || action === void 0 ? void 0 : action.payload)) {
        return false;
    }
    var currentFocusedRoute = (0, native_1.findFocusedRoute)(state);
    var targetFocusedRoute = (0, native_1.findFocusedRoute)(action === null || action === void 0 ? void 0 : action.payload);
    // We want to prevent the user from navigating back to a non-onboarding screen if they are currently on an onboarding screen
    if ((0, isNavigatorName_1.isOnboardingFlowName)(currentFocusedRoute === null || currentFocusedRoute === void 0 ? void 0 : currentFocusedRoute.name) && !(0, isNavigatorName_1.isOnboardingFlowName)(targetFocusedRoute === null || targetFocusedRoute === void 0 ? void 0 : targetFocusedRoute.name)) {
        Welcome.setOnboardingErrorMessage(Localize.translateLocal('onboarding.purpose.errorBackButton'));
        return true;
    }
    return false;
}
function isNavigatingToModalFromModal(state, action) {
    if (action.type !== CONST_1.default.NAVIGATION.ACTION_TYPE.PUSH) {
        return false;
    }
    var lastRoute = state.routes.at(-1);
    // If the last route is a side modal navigator and the generated minimal action want's to push a new side modal navigator that means they are different ones.
    // We want to dismiss the one that is currently on the top.
    return (0, isSideModalNavigator_1.default)(lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) && (0, isSideModalNavigator_1.default)(action.payload.name);
}
function RootStackRouter(options) {
    var stackRouter = (0, native_1.StackRouter)(options);
    return __assign(__assign({}, stackRouter), { getStateForAction: function (state, action, configOptions) {
            if (isOpenWorkspaceSplitAction(action)) {
                return (0, GetStateForActionHandlers_1.handleOpenWorkspaceSplitAction)(state, action, configOptions, stackRouter);
            }
            if (isDismissModalAction(action)) {
                return (0, GetStateForActionHandlers_1.handleDismissModalAction)(state, configOptions, stackRouter);
            }
            if (isReplaceAction(action) && action.payload.name === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR) {
                return (0, GetStateForActionHandlers_1.handleReplaceReportsSplitNavigatorAction)(state, action, configOptions, stackRouter);
            }
            // When navigating to a specific workspace from WorkspaceListPage there should be entering animation for its sidebar (only case where we want animation for sidebar)
            // That's why we have a separate handler for opening it called handleOpenWorkspaceSplitAction
            // options for WorkspaceSplitNavigator can be found in AuthScreens.tsx > getWorkspaceSplitNavigatorOptions
            if (isPushAction(action) && (0, isNavigatorName_1.isFullScreenName)(action.payload.name) && action.payload.name !== NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR) {
                return (0, GetStateForActionHandlers_1.handlePushFullscreenAction)(state, action, configOptions, stackRouter);
            }
            // Don't let the user navigate back to a non-onboarding screen if they are currently on an onboarding screen and it's not finished.
            if (shouldPreventReset(state, action)) {
                (0, syncBrowserHistory_1.default)(state);
                return state;
            }
            if (isNavigatingToModalFromModal(state, action)) {
                return (0, GetStateForActionHandlers_1.handleNavigatingToModalFromModal)(state, action, configOptions, stackRouter);
            }
            return stackRouter.getStateForAction(state, action, configOptions);
        } });
}
exports.default = RootStackRouter;
