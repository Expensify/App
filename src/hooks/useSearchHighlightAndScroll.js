"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var Search_1 = require("@libs/actions/Search");
var SearchUIUtils_1 = require("@libs/SearchUIUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var usePrevious_1 = require("./usePrevious");
/**
 * Hook used to trigger a search when a new transaction or report action is added and handle highlighting and scrolling.
 */
function useSearchHighlightAndScroll(_a) {
    var searchResults = _a.searchResults, transactions = _a.transactions, previousTransactions = _a.previousTransactions, reportActions = _a.reportActions, previousReportActions = _a.previousReportActions, queryJSON = _a.queryJSON, offset = _a.offset;
    var isFocused = (0, native_1.useIsFocused)();
    // Ref to track if the search was triggered by this hook
    var triggeredByHookRef = (0, react_1.useRef)(false);
    var searchTriggeredRef = (0, react_1.useRef)(false);
    var hasNewItemsRef = (0, react_1.useRef)(false);
    var previousSearchResults = (0, usePrevious_1.default)(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data);
    var _b = (0, react_1.useState)(null), newSearchResultKey = _b[0], setNewSearchResultKey = _b[1];
    var highlightedIDs = (0, react_1.useRef)(new Set());
    var initializedRef = (0, react_1.useRef)(false);
    var hasPendingSearchRef = (0, react_1.useRef)(false);
    var isChat = queryJSON.type === CONST_1.default.SEARCH.DATA_TYPES.CHAT;
    var existingSearchResultIDs = (0, react_1.useMemo)(function () {
        if (!(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data)) {
            return [];
        }
        return isChat ? extractReportActionIDsFromSearchResults(searchResults.data) : extractTransactionIDsFromSearchResults(searchResults.data);
    }, [searchResults === null || searchResults === void 0 ? void 0 : searchResults.data, isChat]);
    // Trigger search when a new report action is added while on chat or when a new transaction is added for the other search types.
    (0, react_1.useEffect)(function () {
        var previousTransactionsIDs = Object.keys(previousTransactions !== null && previousTransactions !== void 0 ? previousTransactions : {});
        var transactionsIDs = Object.keys(transactions !== null && transactions !== void 0 ? transactions : {});
        var reportActionsIDs = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})
            .map(function (actions) { return Object.keys(actions !== null && actions !== void 0 ? actions : {}); })
            .flat();
        var previousReportActionsIDs = Object.values(previousReportActions !== null && previousReportActions !== void 0 ? previousReportActions : {})
            .map(function (actions) { return Object.keys(actions !== null && actions !== void 0 ? actions : {}); })
            .flat();
        // Only proceed if we have previous data to compare against
        // This prevents triggering on initial data load
        if (previousTransactionsIDs.length === 0 && previousReportActionsIDs.length === 0) {
            return;
        }
        var hasTransactionsIDsChange = transactionsIDs.some(function (id) { return !previousTransactionsIDs.includes(id); });
        var hasReportActionsIDsChange = reportActionsIDs.some(function (id) { return !previousReportActionsIDs.includes(id); });
        // Check if there is a change in the transactions or report actions list
        if ((!isChat && hasTransactionsIDsChange) || hasReportActionsIDsChange || hasPendingSearchRef.current) {
            // If we're not focused, don't trigger search
            if (!isFocused) {
                hasPendingSearchRef.current = true;
                return;
            }
            hasPendingSearchRef.current = false;
            var newIDs_1 = isChat ? reportActionsIDs : transactionsIDs;
            var hasAGenuinelyNewID = newIDs_1.some(function (id) { return !existingSearchResultIDs.includes(id); });
            // Only skip search if there are no new items AND search results aren't empty
            // This ensures deletions that result in empty data still trigger search
            if (!hasAGenuinelyNewID && existingSearchResultIDs.length > 0) {
                var hasDeletedID = existingSearchResultIDs.some(function (id) { return !newIDs_1.includes(id); });
                if (!hasDeletedID) {
                    return;
                }
            }
            // We only want to highlight new items if the addition of transactions or report actions triggered the search.
            // This is because, on deletion of items, the backend sometimes returns old items in place of the deleted ones.
            // We don't want to highlight these old items, even if they appear new in the current search results.
            hasNewItemsRef.current = isChat ? reportActionsIDs.length > previousReportActionsIDs.length : transactionsIDs.length > previousTransactionsIDs.length;
            // Set the flag indicating the search is triggered by the hook
            triggeredByHookRef.current = true;
            // Trigger the search
            (0, Search_1.search)({ queryJSON: queryJSON, offset: offset });
            // Set the ref to prevent further triggers until reset
            searchTriggeredRef.current = true;
        }
    }, [isFocused, transactions, previousTransactions, queryJSON, offset, reportActions, previousReportActions, isChat, searchResults === null || searchResults === void 0 ? void 0 : searchResults.data, existingSearchResultIDs]);
    // Initialize the set with existing IDs only once
    (0, react_1.useEffect)(function () {
        if (initializedRef.current || !(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data)) {
            return;
        }
        highlightedIDs.current = new Set(existingSearchResultIDs);
        initializedRef.current = true;
    }, [searchResults === null || searchResults === void 0 ? void 0 : searchResults.data, isChat, existingSearchResultIDs]);
    // Detect new items (transactions or report actions)
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (!previousSearchResults || !(searchResults === null || searchResults === void 0 ? void 0 : searchResults.data)) {
            return;
        }
        if (isChat) {
            var previousReportActionIDs_1 = extractReportActionIDsFromSearchResults(previousSearchResults);
            var currentReportActionIDs = extractReportActionIDsFromSearchResults(searchResults.data);
            // Find new report action IDs that are not in the previousReportActionIDs and not already highlighted
            var newReportActionIDs = currentReportActionIDs.filter(function (id) { return !previousReportActionIDs_1.includes(id) && !highlightedIDs.current.has(id); });
            if (!triggeredByHookRef.current || newReportActionIDs.length === 0 || !hasNewItemsRef.current) {
                return;
            }
            var newReportActionID = (_a = newReportActionIDs.at(0)) !== null && _a !== void 0 ? _a : '';
            var newReportActionKey = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(newReportActionID);
            setNewSearchResultKey(newReportActionKey);
            highlightedIDs.current.add(newReportActionID);
        }
        else {
            var previousTransactionIDs_1 = extractTransactionIDsFromSearchResults(previousSearchResults);
            var currentTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);
            // Find new transaction IDs that are not in the previousTransactionIDs and not already highlighted
            var newTransactionIDs = currentTransactionIDs.filter(function (id) { return !previousTransactionIDs_1.includes(id) && !highlightedIDs.current.has(id); });
            if (!triggeredByHookRef.current || newTransactionIDs.length === 0 || !hasNewItemsRef.current) {
                return;
            }
            var newTransactionID = (_b = newTransactionIDs.at(0)) !== null && _b !== void 0 ? _b : '';
            var newTransactionKey = "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(newTransactionID);
            setNewSearchResultKey(newTransactionKey);
            highlightedIDs.current.add(newTransactionID);
        }
    }, [searchResults === null || searchResults === void 0 ? void 0 : searchResults.data, previousSearchResults, isChat]);
    // Reset newSearchResultKey after it's been used
    (0, react_1.useEffect)(function () {
        if (newSearchResultKey === null) {
            return;
        }
        var timer = setTimeout(function () {
            setNewSearchResultKey(null);
        }, CONST_1.default.ANIMATED_HIGHLIGHT_START_DURATION);
        return function () { return clearTimeout(timer); };
    }, [newSearchResultKey]);
    /**
     * Callback to handle scrolling to the new search result.
     */
    var handleSelectionListScroll = (0, react_1.useCallback)(function (data, ref) {
        // Early return if there's no ref, new transaction wasn't brought in by this hook
        // or there's no new search result key
        if (!ref || !triggeredByHookRef.current || newSearchResultKey === null) {
            return;
        }
        // Extract the transaction/report action ID from the newSearchResultKey
        var newID = newSearchResultKey.replace(isChat ? ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS : ONYXKEYS_1.default.COLLECTION.TRANSACTION, '');
        // Find the index of the new transaction/report action in the data array
        var indexOfNewItem = data.findIndex(function (item) {
            if (isChat) {
                if ('reportActionID' in item && item.reportActionID === newID) {
                    return true;
                }
            }
            else {
                // Handle TransactionListItemType
                if ('transactionID' in item && item.transactionID === newID) {
                    return true;
                }
                // Handle TransactionGroupListItemType with transactions array
                if ('transactions' in item && Array.isArray(item.transactions)) {
                    return item.transactions.some(function (transaction) { return (transaction === null || transaction === void 0 ? void 0 : transaction.transactionID) === newID; });
                }
            }
            return false;
        });
        // Early return if the new item is not found in the data array
        if (indexOfNewItem <= 0) {
            return;
        }
        // Perform the scrolling action
        ref.scrollToIndex(indexOfNewItem);
        // Reset the trigger flag to prevent unintended future scrolls and highlights
        triggeredByHookRef.current = false;
    }, [newSearchResultKey, isChat]);
    return { newSearchResultKey: newSearchResultKey, handleSelectionListScroll: handleSelectionListScroll };
}
/**
 * Helper function to extract transaction IDs from search results data.
 */
function extractTransactionIDsFromSearchResults(searchResultsData) {
    var transactionIDs = [];
    Object.values(searchResultsData).forEach(function (item) {
        // Check for transactionID directly on the item (TransactionListItemType)
        if (item === null || item === void 0 ? void 0 : item.transactionID) {
            transactionIDs.push(item.transactionID);
        }
        // Check for transactions array within the item (TransactionGroupListItemType)
        if (Array.isArray(item === null || item === void 0 ? void 0 : item.transactions)) {
            item.transactions.forEach(function (transaction) {
                if (!(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)) {
                    return;
                }
                transactionIDs.push(transaction.transactionID);
            });
        }
    });
    return transactionIDs;
}
/**
 * Helper function to extract report action IDs from search results data.
 */
function extractReportActionIDsFromSearchResults(searchResultsData) {
    return Object.keys(searchResultsData !== null && searchResultsData !== void 0 ? searchResultsData : {})
        .filter(SearchUIUtils_1.isReportActionEntry)
        .map(function (key) { var _a; return Object.keys((_a = searchResultsData[key]) !== null && _a !== void 0 ? _a : {}); })
        .flat();
}
exports.default = useSearchHighlightAndScroll;
