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
exports.createBackupTransaction = createBackupTransaction;
exports.removeBackupTransaction = removeBackupTransaction;
exports.restoreOriginalTransactionFromBackup = restoreOriginalTransactionFromBackup;
exports.createDraftTransaction = createDraftTransaction;
exports.removeDraftTransaction = removeDraftTransaction;
exports.removeTransactionReceipt = removeTransactionReceipt;
exports.removeDraftTransactions = removeDraftTransactions;
exports.removeDraftSplitTransaction = removeDraftSplitTransaction;
exports.buildOptimisticTransactionAndCreateDraft = buildOptimisticTransactionAndCreateDraft;
var date_fns_1 = require("date-fns");
var react_native_onyx_1 = require("react-native-onyx");
var IOUUtils_1 = require("@libs/IOUUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Transaction_1 = require("./Transaction");
var connection;
/**
 * Makes a backup copy of a transaction object that can be restored when the user cancels editing a transaction.
 */
function createBackupTransaction(transaction, isDraft) {
    if (!transaction) {
        return;
    }
    // In Strict Mode, the backup logic useEffect is triggered twice on mount. The restore logic is delayed because we need to connect to the onyx first,
    // so it's possible that the restore logic is executed after creating the backup for the 2nd time which will completely clear the backup.
    // To avoid that, we need to cancel the pending connection.
    react_native_onyx_1.default.disconnect(connection);
    var newTransaction = __assign({}, transaction);
    var conn = react_native_onyx_1.default.connect({
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP).concat(transaction.transactionID),
        callback: function (transactionBackup) {
            react_native_onyx_1.default.disconnect(conn);
            if (transactionBackup) {
                // If the transactionBackup exists it means we haven't properly restored original value on unmount
                // such as on page refresh, so we will just restore the transaction from the transactionBackup here.
                react_native_onyx_1.default.set("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID), transactionBackup);
                return;
            }
            // Use set so that it will always fully overwrite any backup transaction that could have existed before
            react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP).concat(transaction.transactionID), newTransaction);
        },
    });
}
/**
 * Removes a transaction from Onyx that was only used temporary in the edit flow
 */
function removeBackupTransaction(transactionID) {
    if (!transactionID) {
        return;
    }
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP).concat(transactionID), null);
}
function restoreOriginalTransactionFromBackup(transactionID, isDraft) {
    if (!transactionID) {
        return;
    }
    connection = react_native_onyx_1.default.connect({
        key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_BACKUP).concat(transactionID),
        callback: function (backupTransaction) {
            react_native_onyx_1.default.disconnect(connection);
            // Use set to completely overwrite the original transaction
            react_native_onyx_1.default.set("".concat(isDraft ? ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), backupTransaction !== null && backupTransaction !== void 0 ? backupTransaction : null);
            removeBackupTransaction(transactionID);
        },
    });
}
function createDraftTransaction(transaction) {
    if (!transaction) {
        return;
    }
    var newTransaction = __assign({}, transaction);
    // Use set so that it will always fully overwrite any backup transaction that could have existed before
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transaction.transactionID), newTransaction);
}
function removeDraftTransaction(transactionID) {
    if (!transactionID) {
        return;
    }
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), null);
}
function removeDraftSplitTransaction(transactionID) {
    if (!transactionID) {
        return;
    }
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), null);
}
function removeDraftTransactions(shouldExcludeInitialTransaction) {
    if (shouldExcludeInitialTransaction === void 0) { shouldExcludeInitialTransaction = false; }
    var draftTransactions = (0, Transaction_1.getDraftTransactions)();
    var draftTransactionsSet = draftTransactions.reduce(function (acc, item) {
        if (shouldExcludeInitialTransaction && item.transactionID === CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID) {
            return acc;
        }
        acc["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(item.transactionID)] = null;
        return acc;
    }, {});
    return react_native_onyx_1.default.multiSet(draftTransactionsSet);
}
function removeTransactionReceipt(transactionID) {
    if (!transactionID) {
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(transactionID), { receipt: null });
}
function buildOptimisticTransactionAndCreateDraft(_a) {
    var initialTransaction = _a.initialTransaction, currentUserPersonalDetails = _a.currentUserPersonalDetails, reportID = _a.reportID;
    var newTransactionID = (0, Transaction_1.generateTransactionID)();
    var _b = initialTransaction !== null && initialTransaction !== void 0 ? initialTransaction : {}, currency = _b.currency, iouRequestType = _b.iouRequestType, isFromGlobalCreate = _b.isFromGlobalCreate, splitPayerAccountIDs = _b.splitPayerAccountIDs;
    var newTransaction = {
        amount: 0,
        created: (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'),
        currency: currency,
        comment: { attendees: (0, IOUUtils_1.formatCurrentUserToAttendee)(currentUserPersonalDetails, reportID) },
        iouRequestType: iouRequestType,
        reportID: reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate: isFromGlobalCreate,
        merchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        splitPayerAccountIDs: splitPayerAccountIDs,
    };
    createDraftTransaction(newTransaction);
    return newTransaction;
}
