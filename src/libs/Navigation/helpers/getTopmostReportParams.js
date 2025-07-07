"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
function getTopmostReportParams(state) {
    var _a, _b;
    if (!state) {
        return;
    }
    var topmostReportsSplitNavigator = (_a = state.routes) === null || _a === void 0 ? void 0 : _a.filter(function (route) { return route.name === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR; }).at(-1);
    if (!topmostReportsSplitNavigator) {
        return;
    }
    var topmostReport = (_b = topmostReportsSplitNavigator.state) === null || _b === void 0 ? void 0 : _b.routes.filter(function (route) { return route.name === SCREENS_1.default.REPORT; }).at(-1);
    if (!topmostReport) {
        return;
    }
    return topmostReport === null || topmostReport === void 0 ? void 0 : topmostReport.params;
}
exports.default = getTopmostReportParams;
