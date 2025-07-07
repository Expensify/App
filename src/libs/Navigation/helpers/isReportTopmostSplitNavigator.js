"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Navigation_1 = require("@libs/Navigation/Navigation");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var isNavigatorName_1 = require("./isNavigatorName");
var isReportTopmostSplitNavigator = function () {
    var _a;
    var rootState = Navigation_1.navigationRef.getRootState();
    if (!rootState) {
        return false;
    }
    return ((_a = rootState.routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); })) === null || _a === void 0 ? void 0 : _a.name) === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR;
};
exports.default = isReportTopmostSplitNavigator;
