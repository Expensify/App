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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageErrorView_1 = require("@components/BlockingViews/FullPageErrorView");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var SearchTableHeader_1 = require("@components/SelectionList/SearchTableHeader");
var SearchRowSkeleton_1 = require("@components/Skeletons/SearchRowSkeleton");
var useLocalize_1 = require("@hooks/useLocalize");
var useMobileSelectionMode_1 = require("@hooks/useMobileSelectionMode");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchHighlightAndScroll_1 = require("@hooks/useSearchHighlightAndScroll");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var Search_1 = require("@libs/actions/Search");
var Timing_1 = require("@libs/actions/Timing");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Log_1 = require("@libs/Log");
var isSearchTopmostFullScreenRoute_1 = require("@libs/Navigation/helpers/isSearchTopmostFullScreenRoute");
var Performance_1 = require("@libs/Performance");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var Navigation_1 = require("@navigation/Navigation");
var EmptySearchView_1 = require("@pages/Search/EmptySearchView");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SearchContext_1 = require("./SearchContext");
var SearchList_1 = require("./SearchList");
var SearchScopeProvider_1 = require("./SearchScopeProvider");
function mapTransactionItemToSelectedEntry(item, reportActions) {
    var _a;
    return [
        item.keyForList,
        {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: item.canHold,
            isHeld: (0, TransactionUtils_1.isOnHold)(item),
            canUnhold: item.canUnhold,
            canChangeReport: (0, ReportUtils_1.canEditFieldOfMoneyRequest)((0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, item.transactionID), CONST_1.default.EDIT_REQUEST_FIELD.REPORT),
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: (_a = item.modifiedAmount) !== null && _a !== void 0 ? _a : item.amount,
        },
    ];
}
function mapToTransactionItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight) {
    var _a;
    return __assign(__assign({}, item), { shouldAnimateInHighlight: shouldAnimateInHighlight, isSelected: ((_a = selectedTransactions[item.keyForList]) === null || _a === void 0 ? void 0 : _a.isSelected) && canSelectMultiple });
}
function mapToItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight) {
    var _a, _b, _c;
    if ((0, SearchUIUtils_1.isTaskListItemType)(item)) {
        return __assign(__assign({}, item), { shouldAnimateInHighlight: shouldAnimateInHighlight });
    }
    if ((0, SearchUIUtils_1.isReportActionListItemType)(item)) {
        return __assign(__assign({}, item), { shouldAnimateInHighlight: shouldAnimateInHighlight });
    }
    return (0, SearchUIUtils_1.isTransactionListItemType)(item)
        ? mapToTransactionItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight)
        : __assign(__assign({}, item), { shouldAnimateInHighlight: shouldAnimateInHighlight, transactions: (_a = item.transactions) === null || _a === void 0 ? void 0 : _a.map(function (transaction) { return mapToTransactionItemWithAdditionalInfo(transaction, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight); }), isSelected: ((_b = item === null || item === void 0 ? void 0 : item.transactions) === null || _b === void 0 ? void 0 : _b.length) > 0 &&
                ((_c = item.transactions) === null || _c === void 0 ? void 0 : _c.filter(function (t) { return !(0, TransactionUtils_1.isTransactionPendingDelete)(t); }).every(function (transaction) { var _a; return ((_a = selectedTransactions[transaction.keyForList]) === null || _a === void 0 ? void 0 : _a.isSelected) && canSelectMultiple; })) });
}
function prepareTransactionsList(item, selectedTransactions, reportActions) {
    var _a;
    var _b;
    if ((_b = selectedTransactions[item.keyForList]) === null || _b === void 0 ? void 0 : _b.isSelected) {
        var _c = selectedTransactions, _d = item.keyForList, omittedTransaction = _c[_d], transactions = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
        return transactions;
    }
    return __assign(__assign({}, selectedTransactions), (_a = {}, _a[item.keyForList] = {
        isSelected: true,
        canDelete: item.canDelete,
        canHold: item.canHold,
        isHeld: (0, TransactionUtils_1.isOnHold)(item),
        canUnhold: item.canUnhold,
        canChangeReport: (0, ReportUtils_1.canEditFieldOfMoneyRequest)((0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActions, item.transactionID), CONST_1.default.EDIT_REQUEST_FIELD.REPORT),
        action: item.action,
        reportID: item.reportID,
        policyID: item.policyID,
        amount: Math.abs(item.modifiedAmount || item.amount),
    }, _a));
}
function Search(_a) {
    var _b, _c, _d, _e;
    var queryJSON = _a.queryJSON, currentSearchResults = _a.currentSearchResults, lastNonEmptySearchResults = _a.lastNonEmptySearchResults, onSearchListScroll = _a.onSearchListScroll, contentContainerStyle = _a.contentContainerStyle, handleSearch = _a.handleSearch;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for enabling the selection mode on small screens only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _f = (0, useResponsiveLayout_1.default)(), isSmallScreenWidth = _f.isSmallScreenWidth, isLargeScreenWidth = _f.isLargeScreenWidth;
    var navigation = (0, native_1.useNavigation)();
    var isFocused = (0, native_1.useIsFocused)();
    var _g = (0, SearchContext_1.useSearchContext)(), setCurrentSearchHash = _g.setCurrentSearchHash, setSelectedTransactions = _g.setSelectedTransactions, selectedTransactions = _g.selectedTransactions, clearSelectedTransactions = _g.clearSelectedTransactions, shouldTurnOffSelectionMode = _g.shouldTurnOffSelectionMode, setShouldShowFiltersBarLoading = _g.setShouldShowFiltersBarLoading, lastSearchType = _g.lastSearchType, setShouldShowExportModeOption = _g.setShouldShowExportModeOption, isExportMode = _g.isExportMode, setExportMode = _g.setExportMode;
    var selectionMode = (0, useMobileSelectionMode_1.default)().selectionMode;
    var _h = (0, react_1.useState)(0), offset = _h[0], setOffset = _h[1];
    var type = queryJSON.type, status = queryJSON.status, sortBy = queryJSON.sortBy, sortOrder = queryJSON.sortOrder, hash = queryJSON.hash, groupBy = queryJSON.groupBy;
    var transactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, { canBeMissing: true })[0];
    var previousTransactions = (0, usePrevious_1.default)(transactions);
    var reportActions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, { canBeMissing: true })[0];
    var previousReportActions = (0, usePrevious_1.default)(reportActions);
    var reportActionsArray = (0, react_1.useMemo)(function () {
        return Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})
            .filter(function (reportAction) { return !!reportAction; })
            .flatMap(function (filteredReportActions) { return Object.values(filteredReportActions !== null && filteredReportActions !== void 0 ? filteredReportActions : {}); });
    }, [reportActions]);
    var translate = (0, useLocalize_1.default)().translate;
    var searchListRef = (0, react_1.useRef)(null);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        clearSelectedTransactions(hash);
        setCurrentSearchHash(hash);
    }, [hash, clearSelectedTransactions, setCurrentSearchHash]));
    var searchResults = (currentSearchResults === null || currentSearchResults === void 0 ? void 0 : currentSearchResults.data) ? currentSearchResults : lastNonEmptySearchResults;
    var isSearchResultsEmpty = !(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data) || (0, SearchUIUtils_1.isSearchResultsEmpty)(searchResults);
    (0, react_1.useEffect)(function () {
        if (!isFocused) {
            return;
        }
        var selectedKeys = Object.keys(selectedTransactions).filter(function (key) { return selectedTransactions[key]; });
        if (selectedKeys.length === 0 && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && shouldTurnOffSelectionMode) {
            (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
        }
        // We don't want to run the effect on isFocused change as we only need it to early return when it is false.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTransactions, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled, shouldTurnOffSelectionMode]);
    (0, react_1.useEffect)(function () {
        var selectedKeys = Object.keys(selectedTransactions).filter(function (key) { return selectedTransactions[key]; });
        if (!isSmallScreenWidth) {
            if (selectedKeys.length === 0) {
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
            }
            return;
        }
        if (selectedKeys.length > 0 && !(selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && !isSearchResultsEmpty) {
            (0, MobileSelectionMode_1.turnOnMobileSelectionMode)();
        }
        // We don't need to run the effect on change of isSearchResultsEmpty.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth, selectedTransactions, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled]);
    (0, react_1.useEffect)(function () {
        if (isOffline) {
            return;
        }
        handleSearch({ queryJSON: queryJSON, offset: offset });
    }, [handleSearch, isOffline, offset, queryJSON]);
    (0, react_1.useEffect)(function () {
        (0, Search_1.openSearch)();
    }, []);
    var _j = (0, useSearchHighlightAndScroll_1.default)({
        searchResults: searchResults,
        transactions: transactions,
        previousTransactions: previousTransactions,
        queryJSON: queryJSON,
        offset: offset,
        reportActions: reportActions,
        previousReportActions: previousReportActions,
    }), newSearchResultKey = _j.newSearchResultKey, handleSelectionListScroll = _j.handleSelectionListScroll;
    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    var isDataLoaded = (0, SearchUIUtils_1.isSearchDataLoaded)(currentSearchResults, lastNonEmptySearchResults, queryJSON);
    var shouldShowLoadingState = !isOffline && (!isDataLoaded || (!!(searchResults === null || searchResults === void 0 ? void 0 : searchResults.search.isLoading) && Array.isArray(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data) && (searchResults === null || searchResults === void 0 ? void 0 : searchResults.data.length) === 0));
    var shouldShowLoadingMoreItems = !shouldShowLoadingState && ((_b = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _b === void 0 ? void 0 : _b.isLoading) && ((_c = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _c === void 0 ? void 0 : _c.offset) > 0;
    var prevIsSearchResultEmpty = (0, usePrevious_1.default)(isSearchResultsEmpty);
    var data = (0, react_1.useMemo)(function () {
        if (searchResults === undefined || !isDataLoaded) {
            return [];
        }
        return (0, SearchUIUtils_1.getSections)(type, status, searchResults.data, searchResults.search, groupBy);
    }, [searchResults, isDataLoaded, type, status, groupBy]);
    (0, react_1.useEffect)(function () {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowFiltersBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowFiltersBarLoading, shouldShowLoadingState, type]);
    // When new data load, selectedTransactions is updated in next effect. We use this flag to whether selection is updated
    var isRefreshingSelection = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (type === CONST_1.default.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        var newTransactionList = {};
        if (groupBy) {
            data.forEach(function (transactionGroup) {
                if (!Object.hasOwn(transactionGroup, 'transactions') || !('transactions' in transactionGroup)) {
                    return;
                }
                transactionGroup.transactions.forEach(function (transaction) {
                    var _a;
                    if (!Object.keys(selectedTransactions).includes(transaction.transactionID) && !isExportMode) {
                        return;
                    }
                    newTransactionList[transaction.transactionID] = {
                        action: transaction.action,
                        canHold: transaction.canHold,
                        isHeld: (0, TransactionUtils_1.isOnHold)(transaction),
                        canUnhold: transaction.canUnhold,
                        canChangeReport: (0, ReportUtils_1.canEditFieldOfMoneyRequest)((0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActionsArray, transaction.transactionID), CONST_1.default.EDIT_REQUEST_FIELD.REPORT),
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isSelected: isExportMode || selectedTransactions[transaction.transactionID].isSelected,
                        canDelete: transaction.canDelete,
                        reportID: transaction.reportID,
                        policyID: transaction.policyID,
                        amount: (_a = transaction.modifiedAmount) !== null && _a !== void 0 ? _a : transaction.amount,
                    };
                });
            });
        }
        else {
            data.forEach(function (transaction) {
                var _a;
                if (!Object.hasOwn(transaction, 'transactionID') || !('transactionID' in transaction)) {
                    return;
                }
                if (!Object.keys(selectedTransactions).includes(transaction.transactionID) && !isExportMode) {
                    return;
                }
                newTransactionList[transaction.transactionID] = {
                    action: transaction.action,
                    canHold: transaction.canHold,
                    isHeld: (0, TransactionUtils_1.isOnHold)(transaction),
                    canUnhold: transaction.canUnhold,
                    canChangeReport: (0, ReportUtils_1.canEditFieldOfMoneyRequest)((0, ReportActionsUtils_1.getIOUActionForTransactionID)(reportActionsArray, transaction.transactionID), CONST_1.default.EDIT_REQUEST_FIELD.REPORT),
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isSelected: isExportMode || selectedTransactions[transaction.transactionID].isSelected,
                    canDelete: transaction.canDelete,
                    reportID: transaction.reportID,
                    policyID: transaction.policyID,
                    amount: (_a = transaction.modifiedAmount) !== null && _a !== void 0 ? _a : transaction.amount,
                };
            });
        }
        setSelectedTransactions(newTransactionList, data);
        isRefreshingSelection.current = true;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [data, setSelectedTransactions, isExportMode]);
    (0, react_1.useEffect)(function () {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);
    (0, react_1.useEffect)(function () { return function () {
        if ((0, isSearchTopmostFullScreenRoute_1.default)()) {
            return;
        }
        clearSelectedTransactions();
        (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
    }; }, [isFocused, clearSelectedTransactions]);
    // When selectedTransactions is updated, we confirm that selection is refreshed
    (0, react_1.useEffect)(function () {
        isRefreshingSelection.current = false;
    }, [selectedTransactions]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!data.length || isRefreshingSelection.current || !isFocused) {
            return;
        }
        var areItemsGrouped = !!groupBy;
        var flattenedItems = areItemsGrouped ? data.flatMap(function (item) { return item.transactions; }) : data;
        var isAllSelected = flattenedItems.length === Object.keys(selectedTransactions).length;
        setShouldShowExportModeOption(!!(isAllSelected && ((_a = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _a === void 0 ? void 0 : _a.hasMoreResults)));
        if (!isAllSelected) {
            setExportMode(false);
        }
    }, [isFocused, data, (_d = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _d === void 0 ? void 0 : _d.hasMoreResults, selectedTransactions, setExportMode, setShouldShowExportModeOption, groupBy]);
    var toggleTransaction = (0, react_1.useCallback)(function (item) {
        if ((0, SearchUIUtils_1.isReportActionListItemType)(item)) {
            return;
        }
        if ((0, SearchUIUtils_1.isTaskListItemType)(item)) {
            return;
        }
        if ((0, SearchUIUtils_1.isTransactionListItemType)(item)) {
            if (!item.keyForList) {
                return;
            }
            if ((0, TransactionUtils_1.isTransactionPendingDelete)(item)) {
                return;
            }
            setSelectedTransactions(prepareTransactionsList(item, selectedTransactions, reportActionsArray), data);
            return;
        }
        if (item.transactions.some(function (transaction) { var _a; return (_a = selectedTransactions[transaction.keyForList]) === null || _a === void 0 ? void 0 : _a.isSelected; })) {
            var reducedSelectedTransactions_1 = __assign({}, selectedTransactions);
            item.transactions.forEach(function (transaction) {
                delete reducedSelectedTransactions_1[transaction.keyForList];
            });
            setSelectedTransactions(reducedSelectedTransactions_1, data);
            return;
        }
        setSelectedTransactions(__assign(__assign({}, selectedTransactions), Object.fromEntries(item.transactions.filter(function (t) { return !(0, TransactionUtils_1.isTransactionPendingDelete)(t); }).map(function (transactionItem) { return mapTransactionItemToSelectedEntry(transactionItem, reportActionsArray); }))), data);
    }, [data, reportActionsArray, selectedTransactions, setSelectedTransactions]);
    var openReport = (0, react_1.useCallback)(function (item) {
        if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
            toggleTransaction(item);
            return;
        }
        var isFromSelfDM = item.reportID === CONST_1.default.REPORT.UNREPORTED_REPORT_ID;
        var isTransactionItem = (0, SearchUIUtils_1.isTransactionListItemType)(item);
        var reportID = isTransactionItem && (!item.isFromOneTransactionReport || isFromSelfDM) && item.transactionThreadReportID !== CONST_1.default.REPORT.UNREPORTED_REPORT_ID
            ? item.transactionThreadReportID
            : item.reportID;
        if (!reportID) {
            return;
        }
        Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_REPORT_SEARCH);
        Timing_1.default.start(CONST_1.default.TIMING.OPEN_REPORT_SEARCH);
        var backTo = Navigation_1.default.getActiveRoute();
        if ((0, SearchUIUtils_1.isTransactionGroupListItemType)(item)) {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_MONEY_REQUEST_REPORT.getRoute({ reportID: reportID, backTo: backTo }));
            return;
        }
        // If we're trying to open a legacy transaction without a transaction thread, let's create the thread and navigate the user
        if (isTransactionItem && reportID === CONST_1.default.REPORT.UNREPORTED_REPORT_ID) {
            var generatedReportID = (0, ReportUtils_1.generateReportID)();
            (0, Search_1.updateSearchResultsWithTransactionThreadReportID)(hash, item.transactionID, generatedReportID);
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({
                reportID: generatedReportID,
                backTo: backTo,
                moneyRequestReportActionID: item.moneyRequestReportActionID,
                transactionID: item.transactionID,
            }));
            return;
        }
        if ((0, SearchUIUtils_1.isReportActionListItemType)(item)) {
            var reportActionID = item.reportActionID;
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: reportID, reportActionID: reportActionID, backTo: backTo }));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: reportID, backTo: backTo }));
    }, [hash, selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled, toggleTransaction]);
    var onViewableItemsChanged = (0, react_1.useCallback)(function (_a) {
        var _b;
        var viewableItems = _a.viewableItems;
        var isFirstItemVisible = ((_b = viewableItems.at(0)) === null || _b === void 0 ? void 0 : _b.index) === 1;
        // If the user is still loading the search results, or if they are scrolling down, don't refresh the search results
        if (shouldShowLoadingState || !isFirstItemVisible) {
            return;
        }
        // This line makes sure the app refreshes the search results when the user scrolls to the top.
        // The backend sends items in parts based on the offset, with a limit on the number of items sent (pagination).
        // As a result, it skips some items, for example, if the offset is 100, it sends the next items without the first ones.
        // Therefore, when the user scrolls to the top, we need to refresh the search results.
        setOffset(0);
    }, [shouldShowLoadingState]);
    if (shouldShowLoadingState) {
        return (<SearchRowSkeleton_1.default shouldAnimate containerStyle={shouldUseNarrowLayout && styles.searchListContentContainerStyles}/>);
    }
    if (searchResults === undefined) {
        Log_1.default.alert('[Search] Undefined search type');
        return <FullPageOfflineBlockingView_1.default>{null}</FullPageOfflineBlockingView_1.default>;
    }
    var ListItem = (0, SearchUIUtils_1.getListItem)(type, status, groupBy);
    var sortedData = (0, SearchUIUtils_1.getSortedSections)(type, status, data, sortBy, sortOrder, groupBy);
    var isChat = type === CONST_1.default.SEARCH.DATA_TYPES.CHAT;
    var isTask = type === CONST_1.default.SEARCH.DATA_TYPES.TASK;
    var canSelectMultiple = !isChat && !isTask && (!isSmallScreenWidth || (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) === true);
    var sortedSelectedData = sortedData.map(function (item) {
        var _a;
        var baseKey = isChat
            ? "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(item.reportActionID)
            : "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(item.transactionID);
        // Check if the base key matches the newSearchResultKey (TransactionListItemType)
        var isBaseKeyMatch = baseKey === newSearchResultKey;
        // Check if any transaction within the transactions array (TransactionGroupListItemType) matches the newSearchResultKey
        var isAnyTransactionMatch = !isChat &&
            ((_a = item === null || item === void 0 ? void 0 : item.transactions) === null || _a === void 0 ? void 0 : _a.some(function (transaction) {
                var transactionKey = "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID);
                return transactionKey === newSearchResultKey;
            }));
        // Determine if either the base key or any transaction key matches
        var shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;
        return mapToItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight);
    });
    var hasErrors = Object.keys((_e = searchResults === null || searchResults === void 0 ? void 0 : searchResults.errors) !== null && _e !== void 0 ? _e : {}).length > 0 && !isOffline;
    if (hasErrors) {
        return (<react_native_1.View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <FullPageErrorView_1.default shouldShow subtitleStyle={styles.textSupporting} title={translate('errorPage.title', { isBreakLine: shouldUseNarrowLayout })} subtitle={translate('errorPage.subtitle')}/>
            </react_native_1.View>);
    }
    var visibleDataLength = data.filter(function (item) { return item.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline; }).length;
    if ((0, SearchUIUtils_1.shouldShowEmptyState)(isDataLoaded, visibleDataLength, searchResults.search.type)) {
        return (<react_native_1.View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <EmptySearchView_1.default hash={hash} type={type} groupBy={groupBy} hasResults={searchResults.search.hasResults}/>
            </react_native_1.View>);
    }
    var fetchMoreResults = function () {
        var _a;
        if (!((_a = searchResults === null || searchResults === void 0 ? void 0 : searchResults.search) === null || _a === void 0 ? void 0 : _a.hasMoreResults) || shouldShowLoadingState || shouldShowLoadingMoreItems) {
            return;
        }
        setOffset(offset + CONST_1.default.SEARCH.RESULTS_PAGE_SIZE);
    };
    var toggleAllTransactions = function () {
        var areItemsGrouped = !!groupBy;
        var totalSelected = Object.keys(selectedTransactions).length;
        if (totalSelected > 0) {
            clearSelectedTransactions();
            return;
        }
        if (areItemsGrouped) {
            setSelectedTransactions(Object.fromEntries(data.flatMap(function (item) {
                return item.transactions.filter(function (t) { return !(0, TransactionUtils_1.isTransactionPendingDelete)(t); }).map(function (transactionItem) { return mapTransactionItemToSelectedEntry(transactionItem, reportActionsArray); });
            })), data);
            return;
        }
        setSelectedTransactions(Object.fromEntries(data
            .filter(function (t) { return !(0, TransactionUtils_1.isTransactionPendingDelete)(t); })
            .map(function (transactionItem) { return mapTransactionItemToSelectedEntry(transactionItem, reportActionsArray); })), data);
    };
    var onSortPress = function (column, order) {
        var newQuery = (0, SearchQueryUtils_1.buildSearchQueryString)(__assign(__assign({}, queryJSON), { sortBy: column, sortOrder: order }));
        navigation.setParams({ q: newQuery });
    };
    var shouldShowYear = (0, SearchUIUtils_1.shouldShowYear)(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data);
    var _k = (0, SearchUIUtils_1.getWideAmountIndicators)(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data), shouldShowAmountInWideColumn = _k.shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn = _k.shouldShowTaxAmountInWideColumn;
    var shouldShowSorting = !Array.isArray(status) && !groupBy;
    var shouldShowTableHeader = isLargeScreenWidth && !isChat;
    return (<SearchScopeProvider_1.default isOnSearch>
            <SearchList_1.default ref={searchListRef} data={sortedSelectedData} ListItem={ListItem} onSelectRow={openReport} onCheckboxPress={toggleTransaction} onAllCheckboxPress={toggleAllTransactions} canSelectMultiple={canSelectMultiple} shouldPreventLongPressRow={isChat || isTask} SearchTableHeader={!shouldShowTableHeader ? undefined : (<SearchTableHeader_1.default canSelectMultiple={canSelectMultiple} data={searchResults === null || searchResults === void 0 ? void 0 : searchResults.data} metadata={searchResults === null || searchResults === void 0 ? void 0 : searchResults.search} onSortPress={onSortPress} sortOrder={sortOrder} sortBy={sortBy} shouldShowYear={shouldShowYear} isAmountColumnWide={shouldShowAmountInWideColumn} isTaxAmountColumnWide={shouldShowTaxAmountInWideColumn} shouldShowSorting={shouldShowSorting}/>)} contentContainerStyle={[contentContainerStyle, styles.pb3]} containerStyle={[styles.pv0, type === CONST_1.default.SEARCH.DATA_TYPES.CHAT && !isSmallScreenWidth && styles.pt3]} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} onScroll={onSearchListScroll} onEndReachedThreshold={0.75} onEndReached={fetchMoreResults} ListFooterComponent={shouldShowLoadingMoreItems ? (<SearchRowSkeleton_1.default shouldAnimate fixedNumItems={5}/>) : undefined} queryJSON={queryJSON} onViewableItemsChanged={onViewableItemsChanged} onLayout={function () { return handleSelectionListScroll(sortedSelectedData, searchListRef.current); }}/>
        </SearchScopeProvider_1.default>);
}
Search.displayName = 'Search';
exports.default = Search;
