"use strict";
exports.__esModule = true;
var native_1 = require("@react-navigation/native");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var isNavigatorName_1 = require("./isNavigatorName");
// This function adds the policyID param to the url.
var customGetPathFromState = function (state, options) {
    var path = native_1.getPathFromState(state, options);
    var fullScreenRoute = state.routes.findLast(function (route) { return isNavigatorName_1.isFullScreenName(route.name); });
    var shouldAddPolicyID = (fullScreenRoute === null || fullScreenRoute === void 0 ? void 0 : fullScreenRoute.name) === NAVIGATORS_1["default"].REPORTS_SPLIT_NAVIGATOR;
    if (!shouldAddPolicyID) {
        return path;
    }
    var policyID = fullScreenRoute.params && "policyID" in fullScreenRoute.params ? fullScreenRoute.params.policyID : undefined;
    return "" + (policyID ? "/w/" + policyID : '') + path;
};
exports["default"] = customGetPathFromState;
