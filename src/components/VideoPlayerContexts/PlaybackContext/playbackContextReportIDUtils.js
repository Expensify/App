"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeReportID = exports.getCurrentRouteReportID = exports.NO_REPORT_ID_IN_PARAMS = exports.NO_REPORT_ID = void 0;
exports.findURLInReportOrAncestorAttachments = findURLInReportOrAncestorAttachments;
var native_1 = require("@react-navigation/native");
var getAttachmentDetails_1 = require("@libs/fileDownload/getAttachmentDetails");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var getStateFromPath_1 = require("@navigation/helpers/getStateFromPath");
var Navigation_1 = require("@navigation/Navigation");
var SCREENS_1 = require("@src/SCREENS");
/* NO_REPORT_ID & NO_REPORT_ID_IN_PARAMS are used to differentiate if the ReportID is simply missing or if it is just missing from the route params.
 * Since both are a unique symbol they should not be used outside of these context files to avoid having to always import them.
 * normalizeReportID is used to return the context value outside, so from a calling hook perspective these symbols doesn't matter at all */
var NO_REPORT_ID = Symbol(undefined);
exports.NO_REPORT_ID = NO_REPORT_ID;
var NO_REPORT_ID_IN_PARAMS = Symbol(undefined);
exports.NO_REPORT_ID_IN_PARAMS = NO_REPORT_ID_IN_PARAMS;
var normalizeReportID = function (reportID) {
    if (reportID === NO_REPORT_ID_IN_PARAMS || reportID === NO_REPORT_ID) {
        return undefined;
    }
    return reportID;
};
exports.normalizeReportID = normalizeReportID;
var getCurrentRouteReportID = function (url) {
    var route = Navigation_1.default.getActiveRouteWithoutParams();
    var focusedRoute = (0, native_1.findFocusedRoute)((0, getStateFromPath_1.default)(route));
    var reportIDFromURLParams = new URLSearchParams(Navigation_1.default.getActiveRoute()).get('reportID');
    var focusedRouteReportID = hasReportIdInRouteParams(focusedRoute) ? focusedRoute.params.reportID : reportIDFromURLParams;
    if (!focusedRouteReportID) {
        return NO_REPORT_ID_IN_PARAMS;
    }
    var report = (0, ReportUtils_1.getReportOrDraftReport)(focusedRouteReportID);
    var isFocusedRouteAChatThread = (0, ReportUtils_1.isChatThread)(report);
    var firstReportThatHasURLInAttachments = findURLInReportOrAncestorAttachments(report, url);
    return isFocusedRouteAChatThread ? firstReportThatHasURLInAttachments : focusedRouteReportID;
};
exports.getCurrentRouteReportID = getCurrentRouteReportID;
var screensWithReportID = [SCREENS_1.default.SEARCH.REPORT_RHP, SCREENS_1.default.REPORT, SCREENS_1.default.SEARCH.MONEY_REQUEST_REPORT, SCREENS_1.default.ATTACHMENTS];
function hasReportIdInRouteParams(route) {
    return !!route && !!route.params && !!screensWithReportID.find(function (screen) { return screen === route.name; }) && 'reportID' in route.params;
}
/**
 * Searches recursively through a report and its ancestor reports to find a specified URL in their attachments.
 * The search continues up the ancestry chain until the URL is found or there are no more ancestors.
 *
 * @param currentReport - The current report entry, potentially containing the URL.
 * @param url - The URL to be located in the report or its ancestors' attachments.
 * @returns The report ID where the URL is found, or undefined if not found.
 */
function findURLInReportOrAncestorAttachments(currentReport, url) {
    var _a = currentReport !== null && currentReport !== void 0 ? currentReport : {}, parentReportID = _a.parentReportID, reportID = _a.reportID;
    var reportActions = (0, ReportActionsUtils_1.getAllReportActions)(reportID);
    var hasUrlInAttachments = Object.values(reportActions).some(function (action) {
        var _a = (0, getAttachmentDetails_1.default)((0, ReportActionsUtils_1.getReportActionHtml)(action)), sourceURL = _a.sourceURL, previewSourceURL = _a.previewSourceURL;
        return sourceURL === url || previewSourceURL === url;
    });
    if (hasUrlInAttachments) {
        return reportID !== null && reportID !== void 0 ? reportID : NO_REPORT_ID;
    }
    if (parentReportID) {
        var parentReport = (0, ReportUtils_1.getReportOrDraftReport)(parentReportID);
        return findURLInReportOrAncestorAttachments(parentReport, url);
    }
    return NO_REPORT_ID;
}
