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
exports.Context = void 0;
exports.SearchContextProvider = SearchContextProvider;
exports.useSearchContext = useSearchContext;
var react_1 = require("react");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
var defaultSearchContextData = {
    currentSearchHash: -1,
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    isOnSearch: false,
    shouldTurnOffSelectionMode: false,
};
var defaultSearchContext = __assign(__assign({}, defaultSearchContextData), { lastSearchType: undefined, isExportMode: false, shouldShowExportModeOption: false, shouldShowFiltersBarLoading: false, setLastSearchType: function () { }, setCurrentSearchHash: function () { }, setSelectedTransactions: function () { }, removeTransaction: function () { }, clearSelectedTransactions: function () { }, setShouldShowFiltersBarLoading: function () { }, setShouldShowExportModeOption: function () { }, setExportMode: function () { } });
var Context = react_1.default.createContext(defaultSearchContext);
exports.Context = Context;
function SearchContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(false), shouldShowExportModeOption = _b[0], setShouldShowExportModeOption = _b[1];
    var _c = (0, react_1.useState)(false), isExportMode = _c[0], setExportMode = _c[1];
    var _d = (0, react_1.useState)(false), shouldShowFiltersBarLoading = _d[0], setShouldShowFiltersBarLoading = _d[1];
    var _e = (0, react_1.useState)(undefined), lastSearchType = _e[0], setLastSearchType = _e[1];
    var _f = (0, react_1.useState)(defaultSearchContextData), searchContextData = _f[0], setSearchContextData = _f[1];
    var areTransactionsEmpty = (0, react_1.useRef)(true);
    var setCurrentSearchHash = (0, react_1.useCallback)(function (searchHash) {
        setSearchContextData(function (prevState) { return (__assign(__assign({}, prevState), { currentSearchHash: searchHash })); });
    }, []);
    var setSelectedTransactions = (0, react_1.useCallback)(function (selectedTransactions, data) {
        if (data === void 0) { data = []; }
        if (selectedTransactions instanceof Array) {
            if (!selectedTransactions.length && areTransactionsEmpty.current) {
                areTransactionsEmpty.current = true;
                return;
            }
            areTransactionsEmpty.current = false;
            return setSearchContextData(function (prevState) { return (__assign(__assign({}, prevState), { selectedTransactionIDs: selectedTransactions })); });
        }
        // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
        var selectedReports = [];
        if (data.length && data.every(SearchUIUtils_1.isTransactionReportGroupListItemType)) {
            selectedReports = data
                .filter(function (item) { return (0, ReportUtils_1.isMoneyRequestReport)(item) && item.transactions.every(function (_a) {
                var _b;
                var keyForList = _a.keyForList;
                return (_b = selectedTransactions[keyForList]) === null || _b === void 0 ? void 0 : _b.isSelected;
            }); })
                .map(function (_a) {
                var reportID = _a.reportID, _b = _a.action, action = _b === void 0 ? CONST_1.default.SEARCH.ACTION_TYPES.VIEW : _b, _c = _a.total, total = _c === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _c, policyID = _a.policyID;
                return ({ reportID: reportID, action: action, total: total, policyID: policyID });
            });
        }
        if (data.length && data.every(SearchUIUtils_1.isTransactionMemberGroupListItemType)) {
            selectedReports = data
                .flatMap(function (item) { return item.transactions; })
                .filter(function (_a) {
                var _b;
                var keyForList = _a.keyForList;
                return !!keyForList && ((_b = selectedTransactions[keyForList]) === null || _b === void 0 ? void 0 : _b.isSelected);
            })
                .map(function (_a) {
                var reportID = _a.reportID, _b = _a.action, action = _b === void 0 ? CONST_1.default.SEARCH.ACTION_TYPES.VIEW : _b, _c = _a.amount, total = _c === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _c, policyID = _a.policyID;
                return ({ reportID: reportID, action: action, total: total, policyID: policyID });
            });
        }
        if (data.length && data.every(SearchUIUtils_1.isTransactionCardGroupListItemType)) {
            selectedReports = data
                .flatMap(function (item) { return item.transactions; })
                .filter(function (_a) {
                var _b;
                var keyForList = _a.keyForList;
                return !!keyForList && ((_b = selectedTransactions[keyForList]) === null || _b === void 0 ? void 0 : _b.isSelected);
            })
                .map(function (_a) {
                var reportID = _a.reportID, _b = _a.action, action = _b === void 0 ? CONST_1.default.SEARCH.ACTION_TYPES.VIEW : _b, _c = _a.amount, total = _c === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _c, policyID = _a.policyID;
                return ({ reportID: reportID, action: action, total: total, policyID: policyID });
            });
        }
        if (data.length && data.every(SearchUIUtils_1.isTransactionListItemType)) {
            selectedReports = data
                .filter(function (_a) {
                var _b;
                var keyForList = _a.keyForList;
                return !!keyForList && ((_b = selectedTransactions[keyForList]) === null || _b === void 0 ? void 0 : _b.isSelected);
            })
                .map(function (_a) {
                var reportID = _a.reportID, _b = _a.action, action = _b === void 0 ? CONST_1.default.SEARCH.ACTION_TYPES.VIEW : _b, _c = _a.amount, total = _c === void 0 ? CONST_1.default.DEFAULT_NUMBER_ID : _c, policyID = _a.policyID;
                return ({ reportID: reportID, action: action, total: total, policyID: policyID });
            });
        }
        setSearchContextData(function (prevState) { return (__assign(__assign({}, prevState), { selectedTransactions: selectedTransactions, shouldTurnOffSelectionMode: false, selectedReports: selectedReports })); });
    }, []);
    var clearSelectedTransactions = (0, react_1.useCallback)(function (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode) {
        if (shouldTurnOffSelectionMode === void 0) { shouldTurnOffSelectionMode = false; }
        if (typeof searchHashOrClearIDsFlag === 'boolean') {
            setSelectedTransactions([]);
            return;
        }
        if (searchHashOrClearIDsFlag === searchContextData.currentSearchHash) {
            return;
        }
        setSearchContextData(function (prevState) { return (__assign(__assign({}, prevState), { shouldTurnOffSelectionMode: shouldTurnOffSelectionMode, selectedTransactions: {}, selectedReports: [] })); });
        setShouldShowExportModeOption(false);
        setExportMode(false);
    }, [searchContextData.currentSearchHash, setSelectedTransactions]);
    var removeTransaction = (0, react_1.useCallback)(function (transactionID) {
        var selectedTransactionIDs = searchContextData.selectedTransactionIDs;
        if (!transactionID || !selectedTransactionIDs.length) {
            return;
        }
        setSearchContextData(function (prevState) { return (__assign(__assign({}, prevState), { selectedTransactionIDs: selectedTransactionIDs.filter(function (ID) { return transactionID !== ID; }) })); });
    }, [searchContextData.selectedTransactionIDs]);
    var searchContext = (0, react_1.useMemo)(function () { return (__assign(__assign({}, searchContextData), { removeTransaction: removeTransaction, setCurrentSearchHash: setCurrentSearchHash, setSelectedTransactions: setSelectedTransactions, clearSelectedTransactions: clearSelectedTransactions, shouldShowFiltersBarLoading: shouldShowFiltersBarLoading, setShouldShowFiltersBarLoading: setShouldShowFiltersBarLoading, lastSearchType: lastSearchType, setLastSearchType: setLastSearchType, shouldShowExportModeOption: shouldShowExportModeOption, setShouldShowExportModeOption: setShouldShowExportModeOption, isExportMode: isExportMode, setExportMode: setExportMode })); }, [
        searchContextData,
        setCurrentSearchHash,
        setSelectedTransactions,
        clearSelectedTransactions,
        shouldShowFiltersBarLoading,
        lastSearchType,
        shouldShowExportModeOption,
        setShouldShowExportModeOption,
        isExportMode,
        setExportMode,
        removeTransaction,
    ]);
    return <Context.Provider value={searchContext}>{children}</Context.Provider>;
}
/**
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchContext() {
    return (0, react_1.useContext)(Context);
}
SearchContextProvider.displayName = 'SearchContextProvider';
