"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var RELATIONS_1 = require("@libs/Navigation/linkingConfig/RELATIONS");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
function getSelectedTab(state) {
    var _a;
    var topmostFullScreenRoute = state === null || state === void 0 ? void 0 : state.routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); });
    return RELATIONS_1.FULLSCREEN_TO_TAB[(_a = topmostFullScreenRoute === null || topmostFullScreenRoute === void 0 ? void 0 : topmostFullScreenRoute.name) !== null && _a !== void 0 ? _a : NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR];
}
exports.default = getSelectedTab;
