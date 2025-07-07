"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReportUtils_1 = require("@libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function useReportIsArchived(reportID) {
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID), { canBeMissing: true })[0];
    var isReportArchived = (0, ReportUtils_1.isArchivedReport)(reportNameValuePairs);
    return isReportArchived;
}
exports.default = useReportIsArchived;
