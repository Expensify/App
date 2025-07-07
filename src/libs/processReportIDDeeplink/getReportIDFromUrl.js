"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getReportIDFromUrl;
var ReportUtils_1 = require("@libs/ReportUtils");
function getReportIDFromUrl(url) {
    var _a;
    var currentParams = new URLSearchParams(url);
    var currentExitToRoute = (_a = currentParams.get('exitTo')) !== null && _a !== void 0 ? _a : '';
    var reportID = (0, ReportUtils_1.parseReportRouteParams)(currentExitToRoute).reportID;
    return reportID;
}
