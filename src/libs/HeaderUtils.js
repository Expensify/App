"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPinMenuItem = getPinMenuItem;
exports.getShareMenuItem = getShareMenuItem;
var Expensicons = require("@components/Icon/Expensicons");
var ROUTES_1 = require("@src/ROUTES");
var Report_1 = require("./actions/Report");
var Session_1 = require("./actions/Session");
var Navigation_1 = require("./Navigation/Navigation");
function getPinMenuItem(report) {
    var isPinned = !!report.isPinned;
    return {
        icon: Expensicons.Pin,
        translationKey: isPinned ? 'common.unPin' : 'common.pin',
        onSelected: (0, Session_1.callFunctionIfActionIsAllowed)(function () { return (0, Report_1.togglePinnedState)(report.reportID, isPinned); }),
    };
}
function getShareMenuItem(report, backTo) {
    return {
        icon: Expensicons.QrCode,
        translationKey: 'common.share',
        onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo)); },
    };
}
