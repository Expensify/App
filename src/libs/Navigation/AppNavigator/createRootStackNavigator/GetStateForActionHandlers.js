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
exports.workspaceSplitsWithoutEnteringAnimation = exports.screensWithEnteringAnimation = void 0;
exports.handleDismissModalAction = handleDismissModalAction;
exports.handleNavigatingToModalFromModal = handleNavigatingToModalFromModal;
exports.handleOpenWorkspaceSplitAction = handleOpenWorkspaceSplitAction;
exports.handlePushFullscreenAction = handlePushFullscreenAction;
exports.handleReplaceReportsSplitNavigatorAction = handleReplaceReportsSplitNavigatorAction;
var native_1 = require("@react-navigation/native");
var SCREENS_WITH_NAVIGATION_TAB_BAR_1 = require("@components/Navigation/TopLevelNavigationTabBar/SCREENS_WITH_NAVIGATION_TAB_BAR");
var Log_1 = require("@libs/Log");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var MODAL_ROUTES_TO_DISMISS = [
    NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS_1.default.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS_1.default.FEATURE_TRAINING_MODAL_NAVIGATOR,
    NAVIGATORS_1.default.SHARE_MODAL_NAVIGATOR,
    NAVIGATORS_1.default.TEST_DRIVE_MODAL_NAVIGATOR,
    SCREENS_1.default.NOT_FOUND,
    SCREENS_1.default.ATTACHMENTS,
    SCREENS_1.default.TRANSACTION_RECEIPT,
    SCREENS_1.default.PROFILE_AVATAR,
    SCREENS_1.default.WORKSPACE_AVATAR,
    SCREENS_1.default.REPORT_AVATAR,
    SCREENS_1.default.CONCIERGE,
];
var workspaceSplitsWithoutEnteringAnimation = new Set();
exports.workspaceSplitsWithoutEnteringAnimation = workspaceSplitsWithoutEnteringAnimation;
var screensWithEnteringAnimation = new Set();
exports.screensWithEnteringAnimation = screensWithEnteringAnimation;
/**
 * Handles the OPEN_WORKSPACE_SPLIT action.
 * If the user is on other tab than workspaces and the workspace split is "remembered", this action will be called after pressing the settings tab.
 * It will push the workspace hub split navigator first and then push the workspace split navigator.
 * This allows the user to swipe back on the iOS to the workspace hub split navigator underneath.
 */
function handleOpenWorkspaceSplitAction(state, action, configOptions, stackRouter) {
    var actionToPushWorkspacesList = native_1.StackActions.push(SCREENS_1.default.WORKSPACES_LIST);
    var stateWithWorkspacesList = stackRouter.getStateForAction(state, actionToPushWorkspacesList, configOptions);
    if (!stateWithWorkspacesList) {
        Log_1.default.hmmm('[handleOpenWorkspaceSplitAction] WorkspacesList has not been found in the navigation state.');
        return null;
    }
    var actionToPushWorkspaceSplitNavigator = native_1.StackActions.push(NAVIGATORS_1.default.WORKSPACE_SPLIT_NAVIGATOR, {
        screen: action.payload.screenName,
        params: {
            policyID: action.payload.policyID,
        },
    });
    var rehydratedStateWithWorkspacesList = stackRouter.getRehydratedState(stateWithWorkspacesList, configOptions);
    var stateWithWorkspaceSplitNavigator = stackRouter.getStateForAction(rehydratedStateWithWorkspacesList, actionToPushWorkspaceSplitNavigator, configOptions);
    if (!stateWithWorkspaceSplitNavigator) {
        Log_1.default.hmmm('[handleOpenWorkspaceSplitAction] WorkspaceSplitNavigator has not been found in the navigation state.');
        return null;
    }
    var lastFullScreenRoute = stateWithWorkspaceSplitNavigator.routes.at(-1);
    if (lastFullScreenRoute === null || lastFullScreenRoute === void 0 ? void 0 : lastFullScreenRoute.key) {
        // If the user opened the workspace split navigator from a different tab, we don't want to animate the entering transition.
        // To make it feel like bottom tab navigator.
        workspaceSplitsWithoutEnteringAnimation.add(lastFullScreenRoute.key);
    }
    return stateWithWorkspaceSplitNavigator;
}
function handlePushFullscreenAction(state, action, configOptions, stackRouter) {
    var _a, _b, _c;
    var stateWithNavigator = stackRouter.getStateForAction(state, action, configOptions);
    var navigatorName = action.payload.name;
    if (!stateWithNavigator) {
        Log_1.default.hmmm("[handlePushAction] ".concat(navigatorName, " has not been found in the navigation state."));
        return null;
    }
    var lastFullScreenRoute = stateWithNavigator.routes.at(-1);
    var actionPayloadScreen = ((_a = action.payload) === null || _a === void 0 ? void 0 : _a.params) && 'screen' in action.payload.params ? (_c = (_b = action.payload) === null || _b === void 0 ? void 0 : _b.params) === null || _c === void 0 ? void 0 : _c.screen : undefined;
    // Transitioning to all central screens in each split should be animated
    if ((lastFullScreenRoute === null || lastFullScreenRoute === void 0 ? void 0 : lastFullScreenRoute.key) && actionPayloadScreen && !SCREENS_WITH_NAVIGATION_TAB_BAR_1.default.includes(actionPayloadScreen)) {
        screensWithEnteringAnimation.add(lastFullScreenRoute.key);
    }
    return stateWithNavigator;
}
function handleReplaceReportsSplitNavigatorAction(state, action, configOptions, stackRouter) {
    var stateWithReportsSplitNavigator = stackRouter.getStateForAction(state, action, configOptions);
    if (!stateWithReportsSplitNavigator) {
        Log_1.default.hmmm('[handleReplaceReportsSplitNavigatorAction] ReportsSplitNavigator has not been found in the navigation state.');
        return null;
    }
    var lastReportsSplitNavigator = stateWithReportsSplitNavigator.routes.at(-1);
    // ReportScreen should always be opened with an animation when replacing the navigator
    if (lastReportsSplitNavigator === null || lastReportsSplitNavigator === void 0 ? void 0 : lastReportsSplitNavigator.key) {
        screensWithEnteringAnimation.add(lastReportsSplitNavigator.key);
    }
    return stateWithReportsSplitNavigator;
}
/**
 * Handles the DISMISS_MODAL action.
 * If the last route is a modal route, it has to be popped from the navigation stack.
 */
function handleDismissModalAction(state, configOptions, stackRouter) {
    var lastRoute = state.routes.at(-1);
    var newAction = native_1.StackActions.pop();
    if (!(lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) || !MODAL_ROUTES_TO_DISMISS.includes(lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name)) {
        Log_1.default.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        return null;
    }
    return stackRouter.getStateForAction(state, newAction, configOptions);
}
/**
 * Handles opening a new modal navigator from an existing one.
 */
function handleNavigatingToModalFromModal(state, action, configOptions, stackRouter) {
    var modifiedState = __assign(__assign({}, state), { routes: state.routes.slice(0, -1), index: state.index !== 0 ? state.index - 1 : 0 });
    return stackRouter.getStateForAction(modifiedState, action, configOptions);
}
