"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActiveTransactionThreadIDs = setActiveTransactionThreadIDs;
exports.clearActiveTransactionThreadIDs = clearActiveTransactionThreadIDs;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * When a single transaction report is displayed in RHP it may need extra context in case user navigated to it from MoneyRequestReportView or Reports
 * This context is the list of "sibling" transaction report ids.
 * These "siblings" are child report IDs of every transaction connected to the same parent Report that the original transaction is connected.
 *
 * We save this value in onyx, so that we can correctly display navigation UI in transaction thread RHP.
 */
function setActiveTransactionThreadIDs(ids) {
    return react_native_onyx_1.default.set(ONYXKEYS_1.default.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, ids);
}
function clearActiveTransactionThreadIDs() {
    return react_native_onyx_1.default.set(ONYXKEYS_1.default.TRANSACTION_THREAD_NAVIGATION_REPORT_IDS, null);
}
