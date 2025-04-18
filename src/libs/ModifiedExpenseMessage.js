"use strict";
exports.__esModule = true;
var isEmpty_1 = require("lodash/isEmpty");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var CurrencyUtils_1 = require("./CurrencyUtils");
var DateUtils_1 = require("./DateUtils");
var Localize_1 = require("./Localize");
var Log_1 = require("./Log");
var Parser_1 = require("./Parser");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
// eslint-disable-next-line import/no-cycle
var ReportUtils_1 = require("./ReportUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var allPolicyTags = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
    }
});
var allReports;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) { return (allReports = value); }
});
/**
 * Utility to get message based on boolean literal value.
 */
function getBooleanLiteralMessage(value, truthyMessage, falsyMessage) {
    return value === 'true' ? truthyMessage : falsyMessage;
}
/**
 * Builds the partial message fragment for a modified field on the expense.
 */
function buildMessageFragmentForValue(newValue, oldValue, valueName, valueInQuotes, setFragments, removalFragments, changeFragments, shouldConvertToLowercase) {
    if (shouldConvertToLowercase === void 0) { shouldConvertToLowercase = true; }
    var newValueToDisplay = valueInQuotes ? "\"" + newValue + "\"" : newValue;
    var oldValueToDisplay = valueInQuotes ? "\"" + oldValue + "\"" : oldValue;
    var displayValueName = shouldConvertToLowercase ? valueName.toLowerCase() : valueName;
    var isOldValuePartialMerchant = valueName === Localize_1.translateLocal('common.merchant') && oldValue === CONST_1["default"].TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    // In case of a partial merchant value, we want to avoid user seeing the "(none)" value in the message.
    if (!oldValue || isOldValuePartialMerchant) {
        var fragment = Localize_1.translateLocal('iou.setTheRequest', { valueName: displayValueName, newValueToDisplay: newValueToDisplay });
        setFragments.push(fragment);
    }
    else if (!newValue) {
        var fragment = Localize_1.translateLocal('iou.removedTheRequest', { valueName: displayValueName, oldValueToDisplay: oldValueToDisplay });
        removalFragments.push(fragment);
    }
    else {
        var fragment = Localize_1.translateLocal('iou.updatedTheRequest', { valueName: displayValueName, newValueToDisplay: newValueToDisplay, oldValueToDisplay: oldValueToDisplay });
        changeFragments.push(fragment);
    }
}
/**
 * Get the absolute value for a tax amount.
 */
function getTaxAmountAbsValue(taxAmount) {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    return Math.abs(taxAmount !== null && taxAmount !== void 0 ? taxAmount : 0);
}
/**
 * Get the message line for a modified expense.
 */
function getMessageLine(prefix, messageFragments) {
    if (messageFragments.length === 0) {
        return '';
    }
    return messageFragments.reduce(function (acc, value, index) {
        if (index === messageFragments.length - 1) {
            if (messageFragments.length === 1) {
                return acc + " " + value;
            }
            if (messageFragments.length === 2) {
                return acc + " " + Localize_1.translateLocal('common.and') + " " + value;
            }
            return acc + ", " + Localize_1.translateLocal('common.and') + " " + value;
        }
        if (index === 0) {
            return acc + " " + value;
        }
        return acc + ", " + value;
    }, prefix);
}
function getForDistanceRequest(newMerchant, oldMerchant, newAmount, oldAmount) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var changedField = 'distance';
    if (CONST_1["default"].REGEX.DISTANCE_MERCHANT.test(newMerchant) && CONST_1["default"].REGEX.DISTANCE_MERCHANT.test(oldMerchant)) {
        var oldValues = oldMerchant.split('@');
        var oldDistance = (_b = (_a = oldValues.at(0)) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
        var oldRate = (_d = (_c = oldValues.at(1)) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
        var newValues = newMerchant.split('@');
        var newDistance = (_f = (_e = newValues.at(0)) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '';
        var newRate = (_h = (_g = newValues.at(1)) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : '';
        if (oldDistance === newDistance && oldRate !== newRate) {
            changedField = 'rate';
        }
    }
    else {
        Log_1["default"].hmmm("Distance request merchant doesn't match NewDot format. Defaulting to showing as distance changed.", { newMerchant: newMerchant, oldMerchant: oldMerchant });
    }
    var translatedChangedField = Localize_1.translateLocal("common." + changedField).toLowerCase();
    if (!oldMerchant.length) {
        return Localize_1.translateLocal('iou.setTheDistanceMerchant', { translatedChangedField: translatedChangedField, newMerchant: newMerchant, newAmountToDisplay: newAmount });
    }
    return Localize_1.translateLocal('iou.updatedTheDistanceMerchant', {
        translatedChangedField: translatedChangedField,
        newMerchant: newMerchant,
        oldMerchant: oldMerchant,
        newAmountToDisplay: newAmount,
        oldAmountToDisplay: oldAmount
    });
}
function getForExpenseMovedFromSelfDM(destinationReportID) {
    var destinationReport = allReports === null || allReports === void 0 ? void 0 : allReports["" + ONYXKEYS_1["default"].COLLECTION.REPORT + destinationReportID];
    var rootParentReport = ReportUtils_1.getRootParentReport({ report: destinationReport });
    // In OldDot, expenses could be moved to a self-DM. Return the corresponding message for this case.
    if (ReportUtils_1.isSelfDM(rootParentReport)) {
        return Localize_1.translateLocal('iou.movedToPersonalSpace');
    }
    // In NewDot, the "Move report" flow only supports moving expenses from self-DM to:
    // - A policy expense chat
    // - A 1:1 DM
    var reportName = ReportUtils_1.isPolicyExpenseChat(rootParentReport) ? ReportUtils_1.getPolicyExpenseChatName({ report: rootParentReport }) : ReportUtils_1.buildReportNameFromParticipantNames({ report: rootParentReport });
    var policyName = ReportUtils_1.getPolicyName({ report: rootParentReport, returnEmptyIfNotFound: true });
    // If we can't determine either the report name or policy name, return the default message
    if (isEmpty_1["default"](policyName) && !reportName) {
        return Localize_1.translateLocal('iou.changedTheExpense');
    }
    return Localize_1.translateLocal('iou.movedFromPersonalSpace', {
        reportName: reportName,
        workspaceName: !isEmpty_1["default"](policyName) ? policyName : undefined
    });
}
/**
 * Get the report action message when expense has been modified.
 *
 * ModifiedExpense::getNewDotComment in Web-Expensify should match this.
 * If we change this function be sure to update the backend as well.
 */
function getForReportAction(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    var reportOrID = _a.reportOrID, reportAction = _a.reportAction, searchReports = _a.searchReports;
    if (!ReportActionsUtils_1.isModifiedExpenseAction(reportAction)) {
        return '';
    }
    var reportActionOriginalMessage = ReportActionsUtils_1.getOriginalMessage(reportAction);
    var report;
    if (typeof reportOrID === 'string') {
        report = searchReports ? searchReports.find(function (r) { return r.reportID === reportOrID; }) : allReports === null || allReports === void 0 ? void 0 : allReports["" + ONYXKEYS_1["default"].COLLECTION.REPORT + reportOrID];
    }
    else {
        report = reportOrID;
    }
    if (reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.movedToReportID) {
        return getForExpenseMovedFromSelfDM(reportActionOriginalMessage.movedToReportID);
    }
    var removalFragments = [];
    var setFragments = [];
    var changeFragments = [];
    var isReportActionOriginalMessageAnObject = reportActionOriginalMessage && typeof reportActionOriginalMessage === 'object';
    var hasModifiedAmount = isReportActionOriginalMessageAnObject &&
        'oldAmount' in reportActionOriginalMessage &&
        'oldCurrency' in reportActionOriginalMessage &&
        'amount' in reportActionOriginalMessage &&
        'currency' in reportActionOriginalMessage;
    var hasModifiedMerchant = isReportActionOriginalMessageAnObject && 'oldMerchant' in reportActionOriginalMessage && 'merchant' in reportActionOriginalMessage;
    if (hasModifiedAmount) {
        var oldCurrency = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldCurrency;
        var oldAmountValue = (_b = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldAmount) !== null && _b !== void 0 ? _b : 0;
        var oldAmount = oldAmountValue > 0 ? CurrencyUtils_1.convertToDisplayString((_c = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldAmount) !== null && _c !== void 0 ? _c : 0, oldCurrency) : '';
        var currency = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.currency;
        var amount = CurrencyUtils_1.convertToDisplayString((_d = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.amount) !== null && _d !== void 0 ? _d : 0, currency);
        // Only Distance edits should modify amount and merchant (which stores distance) in a single transaction.
        // We check the merchant is in distance format (includes @) as a sanity check
        if (hasModifiedMerchant && ((_e = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.merchant) !== null && _e !== void 0 ? _e : '').includes('@')) {
            return getForDistanceRequest((_f = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.merchant) !== null && _f !== void 0 ? _f : '', (_g = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldMerchant) !== null && _g !== void 0 ? _g : '', amount, oldAmount);
        }
        buildMessageFragmentForValue(amount, oldAmount, Localize_1.translateLocal('iou.amount'), false, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedComment = isReportActionOriginalMessageAnObject && 'oldComment' in reportActionOriginalMessage && 'newComment' in reportActionOriginalMessage;
    if (hasModifiedComment) {
        buildMessageFragmentForValue(Parser_1["default"].htmlToMarkdown((_h = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.newComment) !== null && _h !== void 0 ? _h : ''), Parser_1["default"].htmlToMarkdown((_j = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldComment) !== null && _j !== void 0 ? _j : ''), Localize_1.translateLocal('common.description'), true, setFragments, removalFragments, changeFragments);
    }
    if ((reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldCreated) && (reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.created)) {
        var formattedOldCreated = DateUtils_1["default"].formatWithUTCTimeZone(reportActionOriginalMessage.oldCreated, CONST_1["default"].DATE.FNS_FORMAT_STRING);
        buildMessageFragmentForValue(reportActionOriginalMessage.created, formattedOldCreated, Localize_1.translateLocal('common.date'), false, setFragments, removalFragments, changeFragments);
    }
    if (hasModifiedMerchant) {
        buildMessageFragmentForValue((_k = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.merchant) !== null && _k !== void 0 ? _k : '', (_l = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldMerchant) !== null && _l !== void 0 ? _l : '', Localize_1.translateLocal('common.merchant'), true, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedCategory = isReportActionOriginalMessageAnObject && 'oldCategory' in reportActionOriginalMessage && 'category' in reportActionOriginalMessage;
    if (hasModifiedCategory) {
        buildMessageFragmentForValue((_m = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.category) !== null && _m !== void 0 ? _m : '', (_o = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldCategory) !== null && _o !== void 0 ? _o : '', Localize_1.translateLocal('common.category'), true, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedTag = isReportActionOriginalMessageAnObject && 'oldTag' in reportActionOriginalMessage && 'tag' in reportActionOriginalMessage;
    if (hasModifiedTag) {
        var policyTags_1 = (_p = allPolicyTags === null || allPolicyTags === void 0 ? void 0 : allPolicyTags["" + ONYXKEYS_1["default"].COLLECTION.POLICY_TAGS + (report === null || report === void 0 ? void 0 : report.policyID)]) !== null && _p !== void 0 ? _p : {};
        var transactionTag = (_q = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.tag) !== null && _q !== void 0 ? _q : '';
        var oldTransactionTag = (_r = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldTag) !== null && _r !== void 0 ? _r : '';
        var splittedTag_1 = TransactionUtils_1.getTagArrayFromName(transactionTag);
        var splittedOldTag_1 = TransactionUtils_1.getTagArrayFromName(oldTransactionTag);
        var localizedTagListName_1 = Localize_1.translateLocal('common.tag');
        var sortedTagKeys = PolicyUtils_1.getSortedTagKeys(policyTags_1);
        sortedTagKeys.forEach(function (policyTagKey, index) {
            var _a, _b;
            var policyTagListName = policyTags_1[policyTagKey].name || localizedTagListName_1;
            var newTag = (_a = splittedTag_1.at(index)) !== null && _a !== void 0 ? _a : '';
            var oldTag = (_b = splittedOldTag_1.at(index)) !== null && _b !== void 0 ? _b : '';
            if (newTag !== oldTag) {
                buildMessageFragmentForValue(PolicyUtils_1.getCleanedTagName(newTag), PolicyUtils_1.getCleanedTagName(oldTag), policyTagListName, true, setFragments, removalFragments, changeFragments, policyTagListName === localizedTagListName_1);
            }
        });
    }
    var hasModifiedTaxAmount = isReportActionOriginalMessageAnObject && 'oldTaxAmount' in reportActionOriginalMessage && 'taxAmount' in reportActionOriginalMessage;
    if (hasModifiedTaxAmount) {
        var currency = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.currency;
        var taxAmount = CurrencyUtils_1.convertToDisplayString(getTaxAmountAbsValue((_s = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.taxAmount) !== null && _s !== void 0 ? _s : 0), currency);
        var oldTaxAmountValue = getTaxAmountAbsValue((_t = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldTaxAmount) !== null && _t !== void 0 ? _t : 0);
        var oldTaxAmount = oldTaxAmountValue > 0 ? CurrencyUtils_1.convertToDisplayString(oldTaxAmountValue, currency) : '';
        buildMessageFragmentForValue(taxAmount, oldTaxAmount, Localize_1.translateLocal('iou.taxAmount'), false, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedTaxRate = isReportActionOriginalMessageAnObject && 'oldTaxRate' in reportActionOriginalMessage && 'taxRate' in reportActionOriginalMessage;
    if (hasModifiedTaxRate) {
        buildMessageFragmentForValue((_u = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.taxRate) !== null && _u !== void 0 ? _u : '', (_v = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldTaxRate) !== null && _v !== void 0 ? _v : '', Localize_1.translateLocal('iou.taxRate'), false, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedBillable = isReportActionOriginalMessageAnObject && 'oldBillable' in reportActionOriginalMessage && 'billable' in reportActionOriginalMessage;
    if (hasModifiedBillable) {
        buildMessageFragmentForValue((_w = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.billable) !== null && _w !== void 0 ? _w : '', (_x = reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldBillable) !== null && _x !== void 0 ? _x : '', Localize_1.translateLocal('iou.expense'), true, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedReimbursable = isReportActionOriginalMessageAnObject && 'oldReimbursable' in reportActionOriginalMessage && 'reimbursable' in reportActionOriginalMessage;
    if (hasModifiedReimbursable) {
        buildMessageFragmentForValue(getBooleanLiteralMessage(reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.reimbursable, Localize_1.translateLocal('iou.reimbursable'), Localize_1.translateLocal('iou.nonReimbursable')), getBooleanLiteralMessage(reportActionOriginalMessage === null || reportActionOriginalMessage === void 0 ? void 0 : reportActionOriginalMessage.oldReimbursable, Localize_1.translateLocal('iou.reimbursable'), Localize_1.translateLocal('iou.nonReimbursable')), Localize_1.translateLocal('iou.expense'), true, setFragments, removalFragments, changeFragments);
    }
    var hasModifiedAttendees = isReportActionOriginalMessageAnObject && 'oldAttendees' in reportActionOriginalMessage && 'newAttendees' in reportActionOriginalMessage;
    if (hasModifiedAttendees) {
        var _y = TransactionUtils_1.getFormattedAttendees(reportActionOriginalMessage.newAttendees, reportActionOriginalMessage.oldAttendees), oldAttendees = _y[0], attendees = _y[1];
        buildMessageFragmentForValue(oldAttendees, attendees, Localize_1.translateLocal('iou.attendees'), false, setFragments, removalFragments, changeFragments);
    }
    var message = getMessageLine("\n" + Localize_1.translateLocal('iou.changed'), changeFragments) +
        getMessageLine("\n" + Localize_1.translateLocal('iou.set'), setFragments) +
        getMessageLine("\n" + Localize_1.translateLocal('iou.removed'), removalFragments);
    if (message === '') {
        return Localize_1.translateLocal('iou.changedTheExpense');
    }
    return "" + message.substring(1, message.length);
}
exports["default"] = {
    getForReportAction: getForReportAction
};
