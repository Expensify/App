"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportMentionDetails = void 0;
var isEmpty_1 = require("lodash/isEmpty");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ReportUtils_1 = require("./ReportUtils");
var removeLeadingLTRAndHash = function (value) { return value.replace(CONST_1.default.UNICODE.LTR, '').replace('#', ''); };
var getReportMentionDetails = function (htmlAttributeReportID, currentReport, reports, tnode) {
    var _a, _b;
    var reportID;
    var mentionDisplayText;
    // Get mention details based on reportID from tag attribute
    if (!(0, isEmpty_1.default)(htmlAttributeReportID)) {
        var report = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(htmlAttributeReportID)];
        reportID = (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : htmlAttributeReportID;
        mentionDisplayText = removeLeadingLTRAndHash((_b = report === null || report === void 0 ? void 0 : report.reportName) !== null && _b !== void 0 ? _b : htmlAttributeReportID);
        // Get mention details from name inside tnode
    }
    else if ('data' in tnode && !(0, EmptyObject_1.isEmptyObject)(tnode.data)) {
        mentionDisplayText = removeLeadingLTRAndHash(tnode.data);
        Object.values(reports !== null && reports !== void 0 ? reports : {}).forEach(function (report) {
            var _a;
            if ((report === null || report === void 0 ? void 0 : report.policyID) !== (currentReport === null || currentReport === void 0 ? void 0 : currentReport.policyID) || !(0, ReportUtils_1.isChatRoom)(report) || removeLeadingLTRAndHash((_a = report === null || report === void 0 ? void 0 : report.reportName) !== null && _a !== void 0 ? _a : '') !== mentionDisplayText) {
                return;
            }
            reportID = report === null || report === void 0 ? void 0 : report.reportID;
        });
    }
    else {
        return null;
    }
    return { reportID: reportID, mentionDisplayText: mentionDisplayText };
};
exports.getReportMentionDetails = getReportMentionDetails;
