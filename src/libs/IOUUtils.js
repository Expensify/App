"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAmount = calculateAmount;
exports.insertTagIntoTransactionTagsString = insertTagIntoTransactionTagsString;
exports.isIOUReportPendingCurrencyConversion = isIOUReportPendingCurrencyConversion;
exports.isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpense;
exports.shouldUseTransactionDraft = shouldUseTransactionDraft;
exports.isValidMoneyRequestType = isValidMoneyRequestType;
exports.navigateToStartMoneyRequestStep = navigateToStartMoneyRequestStep;
exports.updateIOUOwnerAndTotal = updateIOUOwnerAndTotal;
exports.formatCurrentUserToAttendee = formatCurrentUserToAttendee;
exports.shouldStartLocationPermissionFlow = shouldStartLocationPermissionFlow;
exports.navigateToParticipantPage = navigateToParticipantPage;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var CurrencyUtils_1 = require("./CurrencyUtils");
var DateUtils_1 = require("./DateUtils");
var Navigation_1 = require("./Navigation/Navigation");
var Performance_1 = require("./Performance");
var ReportUtils_1 = require("./ReportUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var lastLocationPermissionPrompt;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_LAST_LOCATION_PERMISSION_PROMPT,
    callback: function (val) { return (lastLocationPermissionPrompt = val !== null && val !== void 0 ? val : ''); },
});
function navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID, iouAction) {
    if (iouAction === CONST_1.default.IOU.ACTION.CATEGORIZE || iouAction === CONST_1.default.IOU.ACTION.SUBMIT || iouAction === CONST_1.default.IOU.ACTION.SHARE) {
        Navigation_1.default.goBack();
        return;
    }
    // If the participants were automatically added to the transaction, then the user needs taken back to the starting step
    switch (requestType) {
        case CONST_1.default.IOU.REQUEST_TYPE.DISTANCE:
            Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID), { compareParams: false });
            break;
        case CONST_1.default.IOU.REQUEST_TYPE.SCAN:
            Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID), { compareParams: false });
            break;
        default:
            Navigation_1.default.goBack(ROUTES_1.default.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST_1.default.IOU.ACTION.CREATE, iouType, transactionID, reportID), { compareParams: false });
            break;
    }
}
function navigateToParticipantPage(iouType, transactionID, reportID) {
    Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE_CONTACT);
    switch (iouType) {
        case CONST_1.default.IOU.TYPE.REQUEST:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST_1.default.IOU.TYPE.SUBMIT, transactionID, reportID));
            break;
        case CONST_1.default.IOU.TYPE.SEND:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST_1.default.IOU.TYPE.PAY, transactionID, reportID));
            break;
        default:
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    }
}
/**
 * Calculates the amount per user given a list of participants
 *
 * @param numberOfParticipants - Number of participants in the chat. It should not include the current user.
 * @param total - IOU total amount in backend format (cents, no matter the currency)
 * @param currency - This is used to know how many decimal places are valid to use when splitting the total
 * @param isDefaultUser - Whether we are calculating the amount for the current user
 */
function calculateAmount(numberOfParticipants, total, currency, isDefaultUser) {
    if (isDefaultUser === void 0) { isDefaultUser = false; }
    // Since the backend can maximum store 2 decimal places, any currency with more than 2 decimals
    // has to be capped to 2 decimal places
    var currencyUnit = Math.min(100, (0, CurrencyUtils_1.getCurrencyUnit)(currency));
    var totalInCurrencySubunit = (total / 100) * currencyUnit;
    var totalParticipants = numberOfParticipants + 1;
    var amountPerPerson = Math.round(totalInCurrencySubunit / totalParticipants);
    var finalAmount = amountPerPerson;
    if (isDefaultUser) {
        var sumAmount = amountPerPerson * totalParticipants;
        var difference = totalInCurrencySubunit - sumAmount;
        finalAmount = totalInCurrencySubunit !== sumAmount ? amountPerPerson + difference : amountPerPerson;
    }
    return Math.round((finalAmount * 100) / currencyUnit);
}
/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerAccountID: user2, managerID: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerAccountID: user1, managerID: user2, total: $7 (still a positive amount, but now owed to user1)}
 *
 * @param isDeleting - whether the user is deleting the expense
 * @param isUpdating - whether the user is updating the expense
 */
function updateIOUOwnerAndTotal(iouReport, actorAccountID, amount, currency, isDeleting, isUpdating, isOnHold) {
    var _a, _b;
    if (isDeleting === void 0) { isDeleting = false; }
    if (isUpdating === void 0) { isUpdating = false; }
    if (isOnHold === void 0) { isOnHold = false; }
    // For the update case, we have calculated the diff amount in the calculateDiffAmount function so there is no need to compare currencies here
    if ((currency !== (iouReport === null || iouReport === void 0 ? void 0 : iouReport.currency) && !isUpdating) || !iouReport) {
        return iouReport;
    }
    // Make a copy so we don't mutate the original object
    var iouReportUpdate = __assign({}, iouReport);
    // Let us ensure a valid value before updating the total amount.
    iouReportUpdate.total = (_a = iouReportUpdate.total) !== null && _a !== void 0 ? _a : 0;
    iouReportUpdate.unheldTotal = (_b = iouReportUpdate.unheldTotal) !== null && _b !== void 0 ? _b : 0;
    if (actorAccountID === iouReport.ownerAccountID) {
        iouReportUpdate.total += isDeleting ? -amount : amount;
        if (!isOnHold) {
            iouReportUpdate.unheldTotal += isDeleting ? -amount : amount;
        }
    }
    else {
        iouReportUpdate.total += isDeleting ? amount : -amount;
        if (!isOnHold) {
            iouReportUpdate.unheldTotal += isDeleting ? amount : -amount;
        }
    }
    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerAccountID = iouReport.managerID;
        iouReportUpdate.managerID = iouReport.ownerAccountID;
        iouReportUpdate.total = -iouReportUpdate.total;
        iouReportUpdate.unheldTotal = -iouReportUpdate.unheldTotal;
    }
    return iouReportUpdate;
}
/**
 * Returns whether or not an IOU report contains expenses in a different currency
 * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
 */
function isIOUReportPendingCurrencyConversion(iouReport) {
    var reportTransactions = (0, ReportUtils_1.getReportTransactions)(iouReport.reportID);
    var pendingRequestsInDifferentCurrency = reportTransactions.filter(function (transaction) { return transaction.pendingAction && (0, TransactionUtils_1.getCurrency)(transaction) !== iouReport.currency; });
    return pendingRequestsInDifferentCurrency.length > 0;
}
/**
 * Checks if the iou type is one of request, send, invoice or split.
 */
function isValidMoneyRequestType(iouType) {
    var moneyRequestType = [
        CONST_1.default.IOU.TYPE.REQUEST,
        CONST_1.default.IOU.TYPE.SUBMIT,
        CONST_1.default.IOU.TYPE.SPLIT,
        CONST_1.default.IOU.TYPE.SPLIT_EXPENSE,
        CONST_1.default.IOU.TYPE.SEND,
        CONST_1.default.IOU.TYPE.PAY,
        CONST_1.default.IOU.TYPE.TRACK,
        CONST_1.default.IOU.TYPE.INVOICE,
        CONST_1.default.IOU.TYPE.CREATE,
    ];
    return moneyRequestType.includes(iouType);
}
/**
 * Inserts a newly selected tag into the already existing tags like a string
 *
 * @param transactionTags - currently selected tags for a report
 * @param tag - a newly selected tag, that should be added to the transactionTags
 * @param tagIndex - the index of a tag list
 * @returns
 */
function insertTagIntoTransactionTagsString(transactionTags, tag, tagIndex) {
    var tagArray = (0, TransactionUtils_1.getTagArrayFromName)(transactionTags);
    tagArray[tagIndex] = tag;
    while (tagArray.length > 0 && !tagArray.at(-1)) {
        tagArray.pop();
    }
    return tagArray.map(function (tagItem) { return tagItem.trim(); }).join(CONST_1.default.COLON);
}
function isMovingTransactionFromTrackExpense(action) {
    if (action === CONST_1.default.IOU.ACTION.SUBMIT || action === CONST_1.default.IOU.ACTION.SHARE || action === CONST_1.default.IOU.ACTION.CATEGORIZE) {
        return true;
    }
    return false;
}
function shouldUseTransactionDraft(action, type) {
    return action === CONST_1.default.IOU.ACTION.CREATE || type === CONST_1.default.IOU.TYPE.SPLIT_EXPENSE || isMovingTransactionFromTrackExpense(action);
}
function formatCurrentUserToAttendee(currentUser, reportID) {
    var _a, _b, _c, _d, _e;
    if (!currentUser) {
        return;
    }
    var initialAttendee = {
        email: (_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.login) !== null && _a !== void 0 ? _a : '',
        login: (_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.login) !== null && _b !== void 0 ? _b : '',
        displayName: (_c = currentUser.displayName) !== null && _c !== void 0 ? _c : '',
        avatarUrl: (_e = (_d = currentUser.avatar) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : '',
        accountID: currentUser.accountID,
        text: currentUser.login,
        selected: true,
        reportID: reportID,
    };
    return [initialAttendee];
}
function shouldStartLocationPermissionFlow() {
    return (!lastLocationPermissionPrompt ||
        (DateUtils_1.default.isValidDateString(lastLocationPermissionPrompt !== null && lastLocationPermissionPrompt !== void 0 ? lastLocationPermissionPrompt : '') &&
            DateUtils_1.default.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt !== null && lastLocationPermissionPrompt !== void 0 ? lastLocationPermissionPrompt : '')) > CONST_1.default.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS));
}
