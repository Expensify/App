"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
function getTopmostReportsSplitNavigator() {
    var _a;
    return (_a = navigationRef_1.default.getRootState()) === null || _a === void 0 ? void 0 : _a.routes.findLast(function (route) { return route.name === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR; });
}
exports.default = getTopmostReportsSplitNavigator;
