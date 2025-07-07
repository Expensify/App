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
exports.saveSearch = saveSearch;
exports.search = search;
exports.updateSearchResultsWithTransactionThreadReportID = updateSearchResultsWithTransactionThreadReportID;
exports.deleteMoneyRequestOnSearch = deleteMoneyRequestOnSearch;
exports.holdMoneyRequestOnSearch = holdMoneyRequestOnSearch;
exports.unholdMoneyRequestOnSearch = unholdMoneyRequestOnSearch;
exports.exportSearchItemsToCSV = exportSearchItemsToCSV;
exports.queueExportSearchItemsToCSV = queueExportSearchItemsToCSV;
exports.updateAdvancedFilters = updateAdvancedFilters;
exports.clearAllFilters = clearAllFilters;
exports.clearAdvancedFilters = clearAdvancedFilters;
exports.deleteSavedSearch = deleteSavedSearch;
exports.payMoneyRequestOnSearch = payMoneyRequestOnSearch;
exports.approveMoneyRequestOnSearch = approveMoneyRequestOnSearch;
exports.handleActionButtonPress = handleActionButtonPress;
exports.submitMoneyRequestOnSearch = submitMoneyRequestOnSearch;
exports.openSearchFiltersCardPage = openSearchFiltersCardPage;
exports.openSearch = openSearchPage;
exports.getLastPolicyPaymentMethod = getLastPolicyPaymentMethod;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils_1 = require("@libs/ApiUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var fileDownload_1 = require("@libs/fileDownload");
var enhanceParameters_1 = require("@libs/Network/enhanceParameters");
var NumberUtils_1 = require("@libs/NumberUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var Sound_1 = require("@libs/Sound");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SearchAdvancedFiltersForm_1 = require("@src/types/form/SearchAdvancedFiltersForm");
var lastPaymentMethod;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_LAST_PAYMENT_METHOD,
    callback: function (val) {
        lastPaymentMethod = val;
    },
});
var allSnapshots;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.SNAPSHOT,
    callback: function (val) {
        allSnapshots = val;
    },
    waitForCollectionCallback: true,
});
function handleActionButtonPress(hash, item, goToItem, isInMobileSelectionMode) {
    var _a, _b, _c;
    // The transactionIDList is needed to handle actions taken on `status:all` where transactions on single expense reports can be approved/paid.
    // We need the transactionID to display the loading indicator for that list item's action.
    var transactionID = (0, SearchUIUtils_1.isTransactionListItemType)(item) ? [item.transactionID] : undefined;
    var allReportTransactions = ((0, SearchUIUtils_1.isTransactionGroupListItemType)(item) ? item.transactions : [item]);
    var hasHeldExpense = (0, ReportUtils_1.hasHeldExpenses)('', allReportTransactions);
    if (hasHeldExpense || isInMobileSelectionMode) {
        goToItem();
        return;
    }
    switch (item.action) {
        case CONST_1.default.SEARCH.ACTION_TYPES.PAY:
            getPayActionCallback(hash, item, goToItem);
            return;
        case CONST_1.default.SEARCH.ACTION_TYPES.APPROVE:
            approveMoneyRequestOnSearch(hash, [item.reportID], transactionID);
            return;
        case CONST_1.default.SEARCH.ACTION_TYPES.SUBMIT: {
            var policy = ((_c = (_b = (_a = allSnapshots === null || allSnapshots === void 0 ? void 0 : allSnapshots["".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash)]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(item.policyID)]) !== null && _c !== void 0 ? _c : {});
            submitMoneyRequestOnSearch(hash, [item], [policy], transactionID);
            return;
        }
        default:
            goToItem();
    }
}
function getLastPolicyPaymentMethod(policyID, lastPaymentMethods) {
    var _a;
    if (!policyID) {
        return null;
    }
    var lastPolicyPaymentMethod = null;
    if (typeof (lastPaymentMethods === null || lastPaymentMethods === void 0 ? void 0 : lastPaymentMethods[policyID]) === 'string') {
        lastPolicyPaymentMethod = lastPaymentMethods === null || lastPaymentMethods === void 0 ? void 0 : lastPaymentMethods[policyID];
    }
    else {
        lastPolicyPaymentMethod = (_a = lastPaymentMethods === null || lastPaymentMethods === void 0 ? void 0 : lastPaymentMethods[policyID]) === null || _a === void 0 ? void 0 : _a.lastUsed.name;
    }
    return lastPolicyPaymentMethod;
}
function getPayActionCallback(hash, item, goToItem) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var lastPolicyPaymentMethod = getLastPolicyPaymentMethod(item.policyID, lastPaymentMethod);
    if (!lastPolicyPaymentMethod) {
        goToItem();
        return;
    }
    var report = ((_c = (_b = (_a = allSnapshots === null || allSnapshots === void 0 ? void 0 : allSnapshots["".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash)]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.reportID)]) !== null && _c !== void 0 ? _c : {});
    var amount = Math.abs(((_d = report === null || report === void 0 ? void 0 : report.total) !== null && _d !== void 0 ? _d : 0) - ((_e = report === null || report === void 0 ? void 0 : report.nonReimbursableTotal) !== null && _e !== void 0 ? _e : 0));
    var transactionID = (0, SearchUIUtils_1.isTransactionListItemType)(item) ? [item.transactionID] : undefined;
    if (lastPolicyPaymentMethod === CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE) {
        payMoneyRequestOnSearch(hash, [{ reportID: item.reportID, amount: amount, paymentType: lastPolicyPaymentMethod }], transactionID);
        return;
    }
    var hasVBBA = !!((_j = (_h = (_g = (_f = allSnapshots === null || allSnapshots === void 0 ? void 0 : allSnapshots["".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash)]) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(item.policyID)]) === null || _h === void 0 ? void 0 : _h.achAccount) === null || _j === void 0 ? void 0 : _j.bankAccountID);
    if (hasVBBA) {
        payMoneyRequestOnSearch(hash, [{ reportID: item.reportID, amount: amount, paymentType: lastPolicyPaymentMethod }], transactionID);
        return;
    }
    goToItem();
}
function getOnyxLoadingData(hash, queryJSON) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                search: {
                    isLoading: true,
                },
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                errors: null,
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                search: {
                    isLoading: false,
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                data: [],
                search: {
                    status: queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.status,
                    type: queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.type,
                    isLoading: false,
                },
                errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage'),
            },
        },
    ];
    return { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData };
}
function saveSearch(_a) {
    var _b, _c, _d;
    var _e;
    var queryJSON = _a.queryJSON, newName = _a.newName;
    var saveSearchName = (_e = newName !== null && newName !== void 0 ? newName : queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.inputQuery) !== null && _e !== void 0 ? _e : '';
    var jsonQuery = JSON.stringify(queryJSON);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.SAVED_SEARCHES),
            value: (_b = {},
                _b[queryJSON.hash] = {
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    name: saveSearchName,
                    query: queryJSON.inputQuery,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.SAVED_SEARCHES),
            value: (_c = {},
                _c[queryJSON.hash] = null,
                _c),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.SAVED_SEARCHES),
            value: (_d = {},
                _d[queryJSON.hash] = {
                    pendingAction: null,
                },
                _d),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.SAVE_SEARCH, { jsonQuery: jsonQuery, newName: saveSearchName }, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function deleteSavedSearch(hash) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.SAVED_SEARCHES),
            value: (_a = {},
                _a[hash] = {
                    pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.SAVED_SEARCHES),
            value: (_b = {},
                _b[hash] = null,
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.SAVED_SEARCHES),
            value: (_c = {},
                _c[hash] = {
                    pendingAction: null,
                },
                _c),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.DELETE_SAVED_SEARCH, { hash: hash }, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function openSearchFiltersCardPage() {
    var optimisticData = [{ onyxMethod: react_native_onyx_1.default.METHOD.MERGE, key: ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, value: null }];
    var successData = [{ onyxMethod: react_native_onyx_1.default.METHOD.MERGE, key: ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, value: null }];
    var failureData = [{ onyxMethod: react_native_onyx_1.default.METHOD.MERGE, key: ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST, value: null }];
    API.read(types_1.READ_COMMANDS.OPEN_SEARCH_FILTERS_CARD_PAGE, null, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function openSearchPage() {
    API.read(types_1.READ_COMMANDS.OPEN_SEARCH_PAGE, null);
}
function search(_a) {
    var queryJSON = _a.queryJSON, offset = _a.offset;
    var _b = getOnyxLoadingData(queryJSON.hash, queryJSON), optimisticData = _b.optimisticData, finallyData = _b.finallyData, failureData = _b.failureData;
    var flatFilters = queryJSON.flatFilters, queryJSONWithoutFlatFilters = __rest(queryJSON, ["flatFilters"]);
    var queryWithOffset = __assign(__assign({}, queryJSONWithoutFlatFilters), { offset: offset });
    var jsonQuery = JSON.stringify(queryWithOffset);
    API.write(types_1.WRITE_COMMANDS.SEARCH, { hash: queryJSON.hash, jsonQuery: jsonQuery }, { optimisticData: optimisticData, finallyData: finallyData, failureData: failureData });
}
/**
 * It's possible that we return legacy transactions that don't have a transaction thread created yet.
 * In that case, when users select the search result row, we need to create the transaction thread on the fly and update the search result with the new transactionThreadReport
 */
function updateSearchResultsWithTransactionThreadReportID(hash, transactionID, reportID) {
    var _a;
    var onyxUpdate = {
        data: (_a = {},
            _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID)] = {
                transactionThreadReportID: reportID,
            },
            _a),
    };
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash), onyxUpdate);
}
function holdMoneyRequestOnSearch(hash, transactionIDList, comment) {
    var _a = getOnyxLoadingData(hash), optimisticData = _a.optimisticData, finallyData = _a.finallyData;
    API.write(types_1.WRITE_COMMANDS.HOLD_MONEY_REQUEST_ON_SEARCH, { hash: hash, transactionIDList: transactionIDList, comment: comment }, { optimisticData: optimisticData, finallyData: finallyData });
}
function submitMoneyRequestOnSearch(hash, reportList, policy, transactionIDList) {
    var _a, _b;
    var createActionLoadingData = function (isLoading) { return [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                data: transactionIDList
                    ? Object.fromEntries(transactionIDList.map(function (transactionID) { return ["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { isActionLoading: isLoading }]; }))
                    : Object.fromEntries(reportList.map(function (report) { return ["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), { isActionLoading: isLoading }]; })),
            },
        },
    ]; };
    var optimisticData = createActionLoadingData(true);
    var finallyData = createActionLoadingData(false);
    var report = ((_a = reportList.at(0)) !== null && _a !== void 0 ? _a : {});
    var parameters = {
        reportID: report.reportID,
        managerAccountID: (_b = (0, PolicyUtils_1.getSubmitToAccountID)(policy.at(0), report)) !== null && _b !== void 0 ? _b : report === null || report === void 0 ? void 0 : report.managerID,
        reportActionID: (0, NumberUtils_1.rand64)(),
    };
    // The SubmitReport command is not 1:1:1 yet, which means creating a separate SubmitMoneyRequestOnSearch command is not feasible until https://github.com/Expensify/Expensify/issues/451223 is done.
    // In the meantime, we'll call SubmitReport which works for a single expense only, so not bulk actions are possible.
    API.write(types_1.WRITE_COMMANDS.SUBMIT_REPORT, parameters, { optimisticData: optimisticData, finallyData: finallyData });
}
function approveMoneyRequestOnSearch(hash, reportIDList, transactionIDList) {
    var createOnyxData = function (update) { return [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                data: transactionIDList
                    ? Object.fromEntries(transactionIDList.map(function (transactionID) { return ["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), update]; }))
                    : Object.fromEntries(reportIDList.map(function (reportID) { return ["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), update]; })),
            },
        },
    ]; };
    var optimisticData = createOnyxData({ isActionLoading: true });
    var failureData = createOnyxData({ errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage') });
    var finallyData = createOnyxData({ isActionLoading: false });
    (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
    API.write(types_1.WRITE_COMMANDS.APPROVE_MONEY_REQUEST_ON_SEARCH, { hash: hash, reportIDList: reportIDList }, { optimisticData: optimisticData, failureData: failureData, finallyData: finallyData });
}
function payMoneyRequestOnSearch(hash, paymentData, transactionIDList) {
    var createOnyxData = function (update) { return [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(hash),
            value: {
                data: transactionIDList
                    ? Object.fromEntries(transactionIDList.map(function (transactionID) { return ["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), update]; }))
                    : Object.fromEntries(paymentData.map(function (item) { return ["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.reportID), update]; })),
            },
        },
    ]; };
    var optimisticData = createOnyxData({ isActionLoading: true });
    var failureData = createOnyxData({ errors: (0, ErrorUtils_1.getMicroSecondOnyxErrorWithTranslationKey)('common.genericErrorMessage') });
    var finallyData = createOnyxData({ isActionLoading: false });
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.PAY_MONEY_REQUEST_ON_SEARCH, { hash: hash, paymentData: JSON.stringify(paymentData) }, { optimisticData: optimisticData, failureData: failureData, finallyData: finallyData }).then(function (response) {
        if ((response === null || response === void 0 ? void 0 : response.jsonCode) !== CONST_1.default.JSON_CODE.SUCCESS) {
            return;
        }
        (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
    });
}
function unholdMoneyRequestOnSearch(hash, transactionIDList) {
    var _a = getOnyxLoadingData(hash), optimisticData = _a.optimisticData, finallyData = _a.finallyData;
    API.write(types_1.WRITE_COMMANDS.UNHOLD_MONEY_REQUEST_ON_SEARCH, { hash: hash, transactionIDList: transactionIDList }, { optimisticData: optimisticData, finallyData: finallyData });
}
function deleteMoneyRequestOnSearch(hash, transactionIDList) {
    var _a = getOnyxLoadingData(hash), optimisticData = _a.optimisticData, finallyData = _a.finallyData;
    API.write(types_1.WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH, { hash: hash, transactionIDList: transactionIDList }, { optimisticData: optimisticData, finallyData: finallyData });
}
function exportSearchItemsToCSV(_a, onDownloadFailed) {
    var query = _a.query, jsonQuery = _a.jsonQuery, reportIDList = _a.reportIDList, transactionIDList = _a.transactionIDList;
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query: query,
        jsonQuery: jsonQuery,
        reportIDList: reportIDList,
        transactionIDList: transactionIDList,
    });
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (Array.isArray(value)) {
            formData.append(key, value.join(','));
        }
        else {
            formData.append(key, String(value));
        }
    });
    (0, fileDownload_1.default)((0, ApiUtils_1.getCommandURL)({ command: types_1.WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV }), 'Expensify.csv', '', false, formData, CONST_1.default.NETWORK.METHOD.POST, onDownloadFailed);
}
function queueExportSearchItemsToCSV(_a) {
    var query = _a.query, jsonQuery = _a.jsonQuery, reportIDList = _a.reportIDList, transactionIDList = _a.transactionIDList;
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV, {
        query: query,
        jsonQuery: jsonQuery,
        reportIDList: reportIDList,
        transactionIDList: transactionIDList,
    });
    API.write(types_1.WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV, finalParameters);
}
/**
 * Updates the form values for the advanced filters search form.
 */
function updateAdvancedFilters(values) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}
/**
 * Clears all values for the advanced filters search form.
 */
function clearAllFilters() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, null);
}
function clearAdvancedFilters() {
    var values = {};
    Object.values(SearchAdvancedFiltersForm_1.FILTER_KEYS)
        .filter(function (key) { return key !== SearchAdvancedFiltersForm_1.FILTER_KEYS.GROUP_BY; })
        .forEach(function (key) {
        if (key === SearchAdvancedFiltersForm_1.FILTER_KEYS.TYPE) {
            values[key] = CONST_1.default.SEARCH.DATA_TYPES.EXPENSE;
            return;
        }
        if (key === SearchAdvancedFiltersForm_1.FILTER_KEYS.STATUS) {
            values[key] = CONST_1.default.SEARCH.STATUS.EXPENSE.ALL;
            return;
        }
        values[key] = null;
    });
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, values);
}
