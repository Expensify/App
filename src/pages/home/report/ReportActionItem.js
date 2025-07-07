"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnyxProvider_1 = require("@components/OnyxProvider");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var ModifiedExpenseMessage_1 = require("@libs/ModifiedExpenseMessage");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var ReportActions_1 = require("@userActions/ReportActions");
var Transaction_1 = require("@userActions/Transaction");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PureReportActionItem_1 = require("./PureReportActionItem");
function ReportActionItem(_a) {
    var _b;
    var allReports = _a.allReports, action = _a.action, report = _a.report, transactions = _a.transactions, _c = _a.shouldShowDraftMessage, shouldShowDraftMessage = _c === void 0 ? true : _c, props = __rest(_a, ["allReports", "action", "report", "transactions", "shouldShowDraftMessage"]);
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(action);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var originalReportID = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getOriginalReportID)(reportID, action); }, [reportID, action]);
    var originalReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalReportID)];
    var isOriginalReportArchived = (0, useReportIsArchived_1.default)(originalReportID);
    var draftMessage = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(originalReportID), {
        canBeMissing: true,
        selector: function (draftMessagesForReport) {
            if (!shouldShowDraftMessage) {
                return undefined;
            }
            var matchingDraftMessage = draftMessagesForReport === null || draftMessagesForReport === void 0 ? void 0 : draftMessagesForReport[action.reportActionID];
            return typeof matchingDraftMessage === 'string' ? matchingDraftMessage : matchingDraftMessage === null || matchingDraftMessage === void 0 ? void 0 : matchingDraftMessage.message;
        },
    })[0];
    var iouReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(action))];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var emojiReactions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(action.reportActionID), { canBeMissing: true })[0];
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET, { canBeMissing: false })[0];
    var linkedTransactionRouteError = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat((0, ReportActionsUtils_1.isMoneyRequestAction)(action) && ((_b = (0, ReportActionsUtils_1.getOriginalMessage)(action)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID)), {
        canBeMissing: true,
        selector: function (transaction) { var _a, _b; return (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.errorFields) === null || _a === void 0 ? void 0 : _a.route) !== null && _b !== void 0 ? _b : null; },
    })[0];
    var isUserValidated = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return account === null || account === void 0 ? void 0 : account.validated; }, canBeMissing: true })[0];
    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((report === null || report === void 0 ? void 0 : report.parentReportID) || undefined)];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var blockedFromConcierge = (0, OnyxProvider_1.useBlockedFromConcierge)();
    var userBillingFundID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_BILLING_FUND_ID, { canBeMissing: true })[0];
    var targetReport = (0, ReportUtils_1.isChatThread)(report) ? parentReport : report;
    var missingPaymentMethod = (0, ReportUtils_1.getIndicatedMissingPaymentMethod)(userWallet, targetReport === null || targetReport === void 0 ? void 0 : targetReport.reportID, action);
    var taskReport = originalMessage && 'taskReportID' in originalMessage ? allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalMessage.taskReportID)] : undefined;
    var linkedReport = originalMessage && 'linkedReportID' in originalMessage ? allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalMessage.linkedReportID)] : undefined;
    var iouReportOfLinkedReport = linkedReport && 'iouReportID' in linkedReport ? allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(linkedReport.iouReportID)] : undefined;
    return (<PureReportActionItem_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} action={action} report={report} policy={policy} draftMessage={draftMessage} iouReport={iouReport} taskReport={taskReport} linkedReport={linkedReport} iouReportOfLinkedReport={iouReportOfLinkedReport} emojiReactions={emojiReactions} linkedTransactionRouteError={linkedTransactionRouteError} isUserValidated={isUserValidated} parentReport={parentReport} personalDetails={personalDetails} blockedFromConcierge={blockedFromConcierge} originalReportID={originalReportID} deleteReportActionDraft={Report_1.deleteReportActionDraft} isArchivedRoom={(0, ReportUtils_1.isArchivedNonExpenseReport)(originalReport, isOriginalReportArchived)} isChronosReport={(0, ReportUtils_1.chatIncludesChronosWithID)(originalReportID)} toggleEmojiReaction={Report_1.toggleEmojiReaction} createDraftTransactionAndNavigateToParticipantSelector={ReportUtils_1.createDraftTransactionAndNavigateToParticipantSelector} resolveActionableReportMentionWhisper={Report_1.resolveActionableReportMentionWhisper} resolveActionableMentionWhisper={Report_1.resolveActionableMentionWhisper} isClosedExpenseReportWithNoExpenses={(0, ReportUtils_1.isClosedExpenseReportWithNoExpenses)(iouReport, transactions)} isCurrentUserTheOnlyParticipant={ReportUtils_1.isCurrentUserTheOnlyParticipant} missingPaymentMethod={missingPaymentMethod} reimbursementDeQueuedOrCanceledActionMessage={(0, ReportUtils_1.getReimbursementDeQueuedOrCanceledActionMessage)(action, report)} modifiedExpenseMessage={ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: reportID, reportAction: action })} getTransactionsWithReceipts={ReportUtils_1.getTransactionsWithReceipts} clearError={Transaction_1.clearError} clearAllRelatedReportActionErrors={ReportActions_1.clearAllRelatedReportActionErrors} dismissTrackExpenseActionableWhisper={Report_1.dismissTrackExpenseActionableWhisper} userBillingFundID={userBillingFundID}/>);
}
exports.default = ReportActionItem;
