"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.isSettingsTabScreenName = exports.isSplitNavigatorName = exports.isSidebarScreenName = exports.isOnboardingFlowName = exports.isFullScreenName = void 0;
var RELATIONS_1 = require("@libs/Navigation/linkingConfig/RELATIONS");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var ONBOARDING_SCREENS = [
    SCREENS_1["default"].ONBOARDING.PERSONAL_DETAILS,
    SCREENS_1["default"].ONBOARDING.PURPOSE,
    SCREENS_1["default"].ONBOARDING_MODAL.ONBOARDING,
    SCREENS_1["default"].ONBOARDING.EMPLOYEES,
    SCREENS_1["default"].ONBOARDING.ACCOUNTING,
    SCREENS_1["default"].ONBOARDING.PRIVATE_DOMAIN,
    SCREENS_1["default"].ONBOARDING.WORKSPACES,
    SCREENS_1["default"].ONBOARDING.WORK_EMAIL,
    SCREENS_1["default"].ONBOARDING.WORK_EMAIL_VALIDATION,
];
var FULL_SCREENS_SET = new Set(__spreadArrays(Object.values(RELATIONS_1.SIDEBAR_TO_SPLIT), [NAVIGATORS_1["default"].SEARCH_FULLSCREEN_NAVIGATOR]));
var SIDEBARS_SET = new Set(Object.values(RELATIONS_1.SPLIT_TO_SIDEBAR));
var ONBOARDING_SCREENS_SET = new Set(ONBOARDING_SCREENS);
var SPLIT_NAVIGATORS_SET = new Set(Object.values(RELATIONS_1.SIDEBAR_TO_SPLIT));
var SETTINGS_TAB_SET = new Set(Object.values([NAVIGATORS_1["default"].SETTINGS_SPLIT_NAVIGATOR, NAVIGATORS_1["default"].WORKSPACE_SPLIT_NAVIGATOR]));
/**
 * Functions defined below are used to check whether a screen belongs to a specific group.
 * It is mainly used to filter routes in the navigation state.
 */
function checkIfScreenHasMatchingNameToSetValues(screen, set) {
    if (!screen) {
        return false;
    }
    return set.has(screen);
}
function isOnboardingFlowName(screen) {
    return checkIfScreenHasMatchingNameToSetValues(screen, ONBOARDING_SCREENS_SET);
}
exports.isOnboardingFlowName = isOnboardingFlowName;
function isSplitNavigatorName(screen) {
    return checkIfScreenHasMatchingNameToSetValues(screen, SPLIT_NAVIGATORS_SET);
}
exports.isSplitNavigatorName = isSplitNavigatorName;
function isFullScreenName(screen) {
    return checkIfScreenHasMatchingNameToSetValues(screen, FULL_SCREENS_SET);
}
exports.isFullScreenName = isFullScreenName;
function isSidebarScreenName(screen) {
    return checkIfScreenHasMatchingNameToSetValues(screen, SIDEBARS_SET);
}
exports.isSidebarScreenName = isSidebarScreenName;
function isSettingsTabScreenName(screen) {
    return checkIfScreenHasMatchingNameToSetValues(screen, SETTINGS_TAB_SET);
}
exports.isSettingsTabScreenName = isSettingsTabScreenName;
