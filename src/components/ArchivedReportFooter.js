"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var escape_1 = require("lodash/escape");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Banner_1 = require("./Banner");
function ArchivedReportFooter(_a) {
    var _b, _c, _d;
    var report = _a.report;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { initialValue: {} })[0];
    var reportClosedAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), { canEvict: false, selector: ReportActionsUtils.getLastClosedReportAction })[0];
    var originalMessage = ReportActionsUtils.isClosedAction(reportClosedAction) ? ReportActionsUtils.getOriginalMessage(reportClosedAction) : null;
    var archiveReason = (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.reason) !== null && _b !== void 0 ? _b : CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT;
    var actorPersonalDetails = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_c = reportClosedAction === null || reportClosedAction === void 0 ? void 0 : reportClosedAction.actorAccountID) !== null && _c !== void 0 ? _c : -1];
    var displayName = PersonalDetailsUtils.getDisplayNameOrDefault(actorPersonalDetails);
    var oldDisplayName;
    if (archiveReason === CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        var newAccountID = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newAccountID;
        var oldAccountID = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldAccountID;
        displayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[newAccountID !== null && newAccountID !== void 0 ? newAccountID : -1]);
        oldDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[oldAccountID !== null && oldAccountID !== void 0 ? oldAccountID : -1]);
    }
    var shouldRenderHTML = archiveReason !== CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT && archiveReason !== CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED;
    var policyName = ReportUtils.getPolicyName({ report: report });
    if (archiveReason === CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED) {
        policyName = (_d = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.receiverPolicyName) !== null && _d !== void 0 ? _d : '';
    }
    if (shouldRenderHTML) {
        oldDisplayName = (0, escape_1.default)(oldDisplayName);
        displayName = (0, escape_1.default)(displayName);
        policyName = (0, escape_1.default)(policyName);
    }
    var text = shouldRenderHTML
        ? translate("reportArchiveReasons.".concat(archiveReason), {
            displayName: "<strong>".concat(displayName, "</strong>"),
            oldDisplayName: "<strong>".concat(oldDisplayName, "</strong>"),
            policyName: "<strong>".concat(policyName, "</strong>"),
            shouldUseYou: (actorPersonalDetails === null || actorPersonalDetails === void 0 ? void 0 : actorPersonalDetails.accountID) === (0, Report_1.getCurrentUserAccountID)(),
        })
        : translate("reportArchiveReasons.".concat(archiveReason));
    return (<Banner_1.default containerStyles={[styles.chatFooterBanner]} text={text} shouldRenderHTML={shouldRenderHTML} shouldShowIcon/>);
}
ArchivedReportFooter.displayName = 'ArchivedReportFooter';
exports.default = ArchivedReportFooter;
