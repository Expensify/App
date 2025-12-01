import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import ConfirmModal from '@components/ConfirmModal';
import SearchTableHeader, {getExpenseHeaders} from '@components/SelectionListWithSections/SearchTableHeader';
import type {ReportActionListItemType, SearchListItem, SelectionListHandle, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {openOldDotLink} from '@libs/actions/Link';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {openSearch, setOptimisticDataForTransactionThreadPreview} from '@libs/actions/Search';
import Timing from '@libs/actions/Timing';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import Performance from '@libs/Performance';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, selectFilteredReportActions} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import {
    createAndOpenSearchTransactionThread,
    getColumnsToShow,
    getListItem,
    getSections,
    getSortedSections,
    getSuggestedSearches,
    getWideAmountIndicators,
    isReportActionListItemType,
    isSearchDataLoaded,
    isSearchResultsEmpty as isSearchResultsEmptyUtil,
    isTaskListItemType,
    isTransactionCardGroupListItemType,
    isTransactionGroupListItemType,
    isTransactionListItemType,
    isTransactionMemberGroupListItemType,
    isTransactionWithdrawalIDGroupListItemType,
    shouldShowEmptyState,
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import {isOnHold, isTransactionPendingDelete, mergeProhibitedViolations, shouldShowViolation} from '@libs/TransactionUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isActionLoadingSetSelector} from '@src/selectors/ReportMetaData';
import type {OutstandingReportsByPolicyIDDerivedValue} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';
import type {TransactionViolation} from '@src/types/onyx/TransactionViolation';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import {useSearchContext} from './SearchContext';
import SearchList from './SearchList';
import {SearchScopeProvider} from './SearchScopeProvider';
import type {SearchColumnType, SearchParams, SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

type SearchProps = {
    queryJSON: SearchQueryJSON;
    onSearchListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    searchResults?: SearchResults;
    handleSearch: (value: SearchParams) => void;
    onSortPressedCallback?: () => void;
    isMobileSelectionModeEnabled: boolean;
    searchRequestResponseStatusCode?: number | null;
    onDEWModalOpen?: () => void;
};

const expenseHeaders = getExpenseHeaders();

function mapTransactionItemToSelectedEntry(item: TransactionListItemType, outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy);

    return [
        item.keyForList,
        {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canChangeReport: canEditFieldOfMoneyRequest(
                item.reportAction,
                CONST.EDIT_REQUEST_FIELD.REPORT,
                undefined,
                undefined,
                outstandingReportsByPolicyID,
                item,
                item.report,
                item.policy,
            ),
            action: item.action,
            convertedCurrency: item.convertedCurrency,
            reportID: item.reportID,
            policyID: item.report?.policyID,
            amount: item.modifiedAmount ?? item.amount,
            convertedAmount: item.convertedAmount,
            currency: item.currency,
            isFromOneTransactionReport: item.isFromOneTransactionReport,
            ownerAccountID: item.reportAction?.actorAccountID,
        },
    ];
}

function mapToTransactionItemWithAdditionalInfo(
    item: TransactionListItemType,
    selectedTransactions: SelectedTransactions,
    canSelectMultiple: boolean,
    shouldAnimateInHighlight: boolean,
    hash?: number,
) {
    return {...item, shouldAnimateInHighlight, isSelected: selectedTransactions[item.keyForList]?.isSelected && canSelectMultiple, hash};
}

function mapToItemWithAdditionalInfo(item: SearchListItem, selectedTransactions: SelectedTransactions, canSelectMultiple: boolean, shouldAnimateInHighlight: boolean, hash?: number) {
    if (isTaskListItemType(item)) {
        return {
            ...item,
            shouldAnimateInHighlight,
            hash,
        };
    }

    if (isReportActionListItemType(item)) {
        return {
            ...item,
            shouldAnimateInHighlight,
            hash,
        };
    }

    return isTransactionListItemType(item)
        ? mapToTransactionItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight, hash)
        : {
              ...item,
              shouldAnimateInHighlight,
              transactions: item.transactions?.map((transaction) =>
                  mapToTransactionItemWithAdditionalInfo(transaction, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight, hash),
              ),
              isSelected:
                  item?.transactions?.length > 0 &&
                  item.transactions?.filter((t) => !isTransactionPendingDelete(t)).every((transaction) => selectedTransactions[transaction.keyForList]?.isSelected && canSelectMultiple),
              hash,
          };
}

function prepareTransactionsList(item: TransactionListItemType, selectedTransactions: SelectedTransactions, outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy);

    return {
        ...selectedTransactions,
        [item.keyForList]: {
            isSelected: true,
            canDelete: item.canDelete,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canChangeReport: canEditFieldOfMoneyRequest(
                item.reportAction,
                CONST.EDIT_REQUEST_FIELD.REPORT,
                undefined,
                undefined,
                outstandingReportsByPolicyID,
                item,
                item.report,
                item.policy,
            ),
            action: item.action,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: Math.abs(item.modifiedAmount || item.amount),
            convertedAmount: item.convertedAmount,
            convertedCurrency: item.convertedCurrency,
            currency: item.currency,
            isFromOneTransactionReport: item.isFromOneTransactionReport,
            ownerAccountID: item.reportAction?.actorAccountID,
        },
    };
}

function Search({
    queryJSON,
    searchResults,
    onSearchListScroll,
    contentContainerStyle,
    handleSearch,
    isMobileSelectionModeEnabled,
    onSortPressedCallback,
    searchRequestResponseStatusCode,
    onDEWModalOpen,
}: SearchProps) {
    const {type, status, sortBy, sortOrder, hash, similarSearchHash, groupBy} = queryJSON;
    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const [isDEWModalVisible, setIsDEWModalVisible] = useState(false);

    const handleDEWModalOpen = useCallback(() => {
        if (onDEWModalOpen) {
            onDEWModalOpen();
        } else {
            setIsDEWModalVisible(true);
        }
    }, [onDEWModalOpen]);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for enabling the selection mode on small screens only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const isFocused = useIsFocused();
    const {markReportIDAsExpense} = useContext(WideRHPContext);
    const {
        setCurrentSearchHashAndKey,
        setCurrentSearchQueryJSON,
        setSelectedTransactions,
        selectedTransactions,
        clearSelectedTransactions,
        shouldTurnOffSelectionMode,
        setShouldShowFiltersBarLoading,
        lastSearchType,
        shouldShowSelectAllMatchingItems,
        areAllMatchingItemsSelected,
        selectAllMatchingItems,
        shouldResetSearchQuery,
        setShouldResetSearchQuery,
    } = useSearchContext();
    const [offset, setOffset] = useState(0);

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {accountID, email} = useCurrentUserPersonalDetails();
    const [isActionLoadingSet = new Set<string>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}`, {canBeMissing: true, selector: isActionLoadingSetSelector});
    const isExpenseReportType = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    // Filter violations based on user visibility
    const filteredViolations = useMemo(() => {
        if (!violations || !searchResults?.data) {
            return violations;
        }

        const filtered: Record<string, TransactionViolation[]> = {};

        const transactionKeys = Object.keys(searchResults.data).filter((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));

        for (const key of transactionKeys) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const transaction = searchResults.data[key as keyof typeof searchResults.data] as SearchTransaction;
            if (!transaction || typeof transaction !== 'object' || !('transactionID' in transaction) || !('reportID' in transaction)) {
                continue;
            }

            const report = searchResults.data[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
            const policy = searchResults.data[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

            if (report && policy) {
                const transactionViolations = violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
                if (transactionViolations) {
                    const filteredTransactionViolations = mergeProhibitedViolations(
                        transactionViolations.filter((violation) => shouldShowViolation(report as OnyxEntry<Report>, policy as OnyxEntry<Policy>, violation.name, email ?? '')),
                    );

                    if (filteredTransactionViolations.length > 0) {
                        filtered[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] = filteredTransactionViolations;
                    }
                }
            }
        }

        return filtered;
    }, [violations, searchResults, email]);

    const archivedReportsIdSet = useArchivedReportsIdSet();

    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        canBeMissing: true,
        selector: selectFilteredReportActions,
    });

    const {defaultCardFeed} = useCardFeedsForDisplay();
    const suggestedSearches = useMemo(() => getSuggestedSearches(accountID, defaultCardFeed?.id), [defaultCardFeed?.id, accountID]);

    const searchKey = useMemo(() => Object.values(suggestedSearches).find((search) => search.similarSearchHash === similarSearchHash)?.key, [suggestedSearches, similarSearchHash]);

    const shouldCalculateTotals = useSearchShouldCalculateTotals(searchKey, similarSearchHash, offset === 0);

    const previousReportActions = usePrevious(reportActions);
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const searchListRef = useRef<SelectionListHandle | null>(null);

    const clearTransactionsAndSetHashAndKey = useCallback(() => {
        clearSelectedTransactions(hash);
        setCurrentSearchHashAndKey(hash, searchKey);
        setCurrentSearchQueryJSON(queryJSON);
    }, [hash, searchKey, clearSelectedTransactions, setCurrentSearchHashAndKey, setCurrentSearchQueryJSON, queryJSON]);

    useFocusEffect(clearTransactionsAndSetHashAndKey);

    useEffect(() => {
        clearTransactionsAndSetHashAndKey();

        // Trigger once on mount (e.g., on page reload), when RHP is open and screen is not focused
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const validGroupBy = groupBy && Object.values(CONST.SEARCH.GROUP_BY).includes(groupBy) ? groupBy : undefined;
    const isSearchResultsEmpty = !searchResults?.data || isSearchResultsEmptyUtil(searchResults, validGroupBy);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (selectedKeys.length === 0 && isMobileSelectionModeEnabled && shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }

        // We don't want to run the effect on isFocused change as we only need it to early return when it is false.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTransactions, isMobileSelectionModeEnabled, shouldTurnOffSelectionMode]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (!isSmallScreenWidth) {
            if (selectedKeys.length === 0 && isMobileSelectionModeEnabled) {
                turnOffMobileSelectionMode();
            }
            return;
        }
        if (selectedKeys.length > 0 && !isMobileSelectionModeEnabled && !isSearchResultsEmpty) {
            turnOnMobileSelectionMode();
        }
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth, selectedTransactions, isMobileSelectionModeEnabled]);

    useEffect(() => {
        openSearch();
    }, []);

    const {newSearchResultKeys, handleSelectionListScroll, newTransactions} = useSearchHighlightAndScroll({
        searchResults,
        transactions,
        previousTransactions,
        queryJSON,
        searchKey,
        offset,
        shouldCalculateTotals,
        reportActions,
        previousReportActions,
    });

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = isSearchDataLoaded(searchResults, queryJSON);

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    const shouldShowLoadingState =
        !isOffline &&
        (!isDataLoaded || (!!searchResults?.search.isLoading && Array.isArray(searchResults?.data) && searchResults?.data.length === 0) || (hasErrors && !searchRequestResponseStatusCode));
    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;
    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    const [filteredData, filteredDataLength, allDataLength] = useMemo(() => {
        if (searchResults === undefined || !isDataLoaded) {
            return [[], 0, 0];
        }

        // Group-by option cannot be used for chats or tasks
        const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
        const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
        if (validGroupBy && (isChat || isTask)) {
            return [[], 0, 0];
        }

        const [filteredData1, allLength] = getSections({
            type,
            data: searchResults.data,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            formatPhoneNumber,
            groupBy: validGroupBy,
            reportActions: exportReportActions,
            currentSearch: searchKey,
            archivedReportsIDList: archivedReportsIdSet,
            queryJSON,
            isActionLoadingSet,
        });
        return [filteredData1, filteredData1.length, allLength];
    }, [searchKey, exportReportActions, validGroupBy, isDataLoaded, searchResults, type, archivedReportsIdSet, formatPhoneNumber, accountID, queryJSON, email, isActionLoadingSet]);

    useEffect(() => {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowFiltersBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowFiltersBarLoading, shouldShowLoadingState, type]);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        const isMigratedModalDisplayed = focusedRoute?.name === NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR || focusedRoute?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT;

        const comingBackOnlineWithNoResults = prevIsOffline && !isOffline && searchResults === undefined;
        if (!comingBackOnlineWithNoResults && ((!isFocused && !isMigratedModalDisplayed) || isOffline)) {
            return;
        }

        handleSearch({queryJSON, searchKey, offset, shouldCalculateTotals, prevReportsLength: filteredDataLength});

        // We don't need to run the effect on change of isFocused.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSearch, isOffline, offset, queryJSON, searchKey, shouldCalculateTotals]);

    // When new data load, selectedTransactions is updated in next effect. We use this flag to whether selection is updated
    const isRefreshingSelection = useRef(false);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            return;
        }
        const newTransactionList: SelectedTransactions = {};
        if (validGroupBy || isExpenseReportType) {
            for (const transactionGroup of filteredData) {
                if (!Object.hasOwn(transactionGroup, 'transactions') || !('transactions' in transactionGroup)) {
                    continue;
                }

                // For expense reports: when ANY transaction is selected, we want ALL transactions in the report selected.
                // This ensures report-level selection persists when new transactions are added.
                const hasAnySelected = isExpenseReportType && transactionGroup.transactions.some((transaction) => transaction.transactionID in selectedTransactions);

                for (const transactionItem of transactionGroup.transactions) {
                    const isSelected = transactionItem.transactionID in selectedTransactions;

                    // Include transaction if: already individually selected, part of select-all, or (for expense reports) part of a partially-selected report
                    const shouldInclude = isSelected || areAllMatchingItemsSelected || (isExpenseReportType && hasAnySelected);
                    if (!shouldInclude) {
                        continue;
                    }

                    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(
                        transactionItem.report,
                        transactionItem.reportAction,
                        transactionItem.holdReportAction,
                        transactionItem,
                        transactionItem.policy,
                    );

                    newTransactionList[transactionItem.transactionID] = {
                        action: transactionItem.action,
                        canHold: canHoldRequest,
                        isHeld: isOnHold(transactionItem),
                        canUnhold: canUnholdRequest,
                        canChangeReport: canEditFieldOfMoneyRequest(
                            transactionItem.reportAction,
                            CONST.EDIT_REQUEST_FIELD.REPORT,
                            undefined,
                            undefined,
                            outstandingReportsByPolicyID,
                            transactionItem,
                            transactionItem.report,
                            transactionItem.policy,
                        ),
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isSelected: areAllMatchingItemsSelected || selectedTransactions[transactionItem.transactionID]?.isSelected || isExpenseReportType,
                        canDelete: transactionItem.canDelete,
                        reportID: transactionItem.reportID,
                        policyID: transactionItem.report?.policyID,
                        amount: transactionItem.modifiedAmount ?? transactionItem.amount,
                        convertedAmount: transactionItem.convertedAmount,
                        convertedCurrency: transactionItem.convertedCurrency,
                        currency: transactionItem.currency,
                        ownerAccountID: transactionItem.reportAction?.actorAccountID,
                    };
                }
            }
        } else {
            for (const transactionItem of filteredData) {
                if (!Object.hasOwn(transactionItem, 'transactionID') || !('transactionID' in transactionItem)) {
                    continue;
                }
                if (!(transactionItem.transactionID in selectedTransactions) && !areAllMatchingItemsSelected) {
                    continue;
                }

                const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(
                    transactionItem.report,
                    transactionItem.reportAction,
                    transactionItem.holdReportAction,
                    transactionItem,
                    transactionItem.policy,
                );

                newTransactionList[transactionItem.transactionID] = {
                    action: transactionItem.action,
                    canHold: canHoldRequest,
                    isHeld: isOnHold(transactionItem),
                    canUnhold: canUnholdRequest,
                    canChangeReport: canEditFieldOfMoneyRequest(
                        transactionItem.reportAction,
                        CONST.EDIT_REQUEST_FIELD.REPORT,
                        undefined,
                        undefined,
                        outstandingReportsByPolicyID,
                        transactionItem,
                        transactionItem.report,
                        transactionItem.policy,
                    ),
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isSelected: areAllMatchingItemsSelected || selectedTransactions[transactionItem.transactionID].isSelected,
                    canDelete: transactionItem.canDelete,
                    reportID: transactionItem.reportID,
                    policyID: transactionItem.report?.policyID,
                    amount: transactionItem.modifiedAmount ?? transactionItem.amount,
                    convertedAmount: transactionItem.convertedAmount,
                    convertedCurrency: transactionItem.convertedCurrency,
                    currency: transactionItem.currency,
                    ownerAccountID: transactionItem.reportAction?.actorAccountID,
                };
            }
        }
        if (isEmptyObject(newTransactionList)) {
            return;
        }

        setSelectedTransactions(newTransactionList, filteredData);

        isRefreshingSelection.current = true;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [filteredData, setSelectedTransactions, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID, isExpenseReportType]);

    useEffect(() => {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);

    useEffect(
        () => () => {
            if (isSearchTopmostFullScreenRoute()) {
                return;
            }
            clearSelectedTransactions();
            turnOffMobileSelectionMode();
        },
        [isFocused, clearSelectedTransactions],
    );

    // When selectedTransactions is updated, we confirm that selection is refreshed
    useEffect(() => {
        isRefreshingSelection.current = false;
    }, [selectedTransactions]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        if (!filteredData.length || isRefreshingSelection.current) {
            return;
        }
        const areItemsGrouped = !!validGroupBy || type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
        const flattenedItems = areItemsGrouped ? (filteredData as TransactionGroupListItemType[]).flatMap((item) => item.transactions) : filteredData;
        const areAllItemsSelected = flattenedItems.length === Object.keys(selectedTransactions).length;

        // If the user has selected all the expenses in their view but there are more expenses matched by the search
        // give them the option to select all matching expenses
        shouldShowSelectAllMatchingItems(!!(areAllItemsSelected && searchResults?.search?.hasMoreResults));
        if (!areAllItemsSelected) {
            selectAllMatchingItems(false);
        }
    }, [isFocused, filteredData, searchResults?.search?.hasMoreResults, selectedTransactions, selectAllMatchingItems, shouldShowSelectAllMatchingItems, validGroupBy, type]);

    const toggleTransaction = useCallback(
        (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => {
            if (isReportActionListItemType(item)) {
                return;
            }
            if (isTaskListItemType(item)) {
                return;
            }
            if (isTransactionListItemType(item)) {
                if (!item.keyForList) {
                    return;
                }
                if (isTransactionPendingDelete(item)) {
                    return;
                }
                setSelectedTransactions(prepareTransactionsList(item, selectedTransactions, outstandingReportsByPolicyID), filteredData);
                return;
            }

            const currentTransactions = itemTransactions ?? item.transactions;
            if (currentTransactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                const reducedSelectedTransactions: SelectedTransactions = {...selectedTransactions};

                for (const transaction of currentTransactions) {
                    delete reducedSelectedTransactions[transaction.keyForList];
                }

                setSelectedTransactions(reducedSelectedTransactions, filteredData);
                return;
            }

            setSelectedTransactions(
                {
                    ...selectedTransactions,
                    ...Object.fromEntries(
                        currentTransactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => mapTransactionItemToSelectedEntry(transactionItem, outstandingReportsByPolicyID)),
                    ),
                },
                filteredData,
            );
        },
        [filteredData, selectedTransactions, outstandingReportsByPolicyID, setSelectedTransactions],
    );

    const onSelectRow = useCallback(
        (item: SearchListItem, transactionPreviewData?: TransactionPreviewData) => {
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(item);
                return;
            }

            const isTransactionItem = isTransactionListItemType(item);
            const backTo = Navigation.getActiveRoute();

            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionItem && item.transactionThreadReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                // If the report is unreported (self DM), we want to open the track expense thread instead of a report with an ID of 0
                const shouldOpenTransactionThread = !item.isFromOneTransactionReport || item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                createAndOpenSearchTransactionThread(item, hash, backTo, undefined, shouldOpenTransactionThread);
                if (shouldOpenTransactionThread) {
                    return;
                }
            }

            if (isTransactionMemberGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.accountID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false});
                return;
            }

            if (isTransactionCardGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.cardID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false});
                return;
            }

            if (isTransactionWithdrawalIDGroupListItemType(item)) {
                const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID);
                newFlatFilters.push({key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: item.entryID}]});
                const newQueryJSON: SearchQueryJSON = {...queryJSON, groupBy: undefined, flatFilters: newFlatFilters};
                const newQuery = buildSearchQueryString(newQueryJSON);
                const newQueryJSONWithHash = buildSearchQueryJSON(newQuery);
                if (!newQueryJSONWithHash) {
                    return;
                }
                handleSearch({queryJSON: newQueryJSONWithHash, searchKey, offset: 0, shouldCalculateTotals: false});
                return;
            }

            const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

            const reportID =
                isTransactionItem && (!item.isFromOneTransactionReport || isFromSelfDM) && item.transactionThreadReportID !== CONST.REPORT.UNREPORTED_REPORT_ID
                    ? item.transactionThreadReportID
                    : item.reportID;

            if (!reportID) {
                return;
            }

            Performance.markStart(CONST.TIMING.OPEN_REPORT_SEARCH);
            Timing.start(CONST.TIMING.OPEN_REPORT_SEARCH);
            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
                name: 'Search',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            if (isTransactionGroupListItemType(item)) {
                const firstTransaction = item.transactions.at(0);
                if (item.isOneTransactionReport && firstTransaction && transactionPreviewData) {
                    if (firstTransaction.transactionThreadReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                        createAndOpenSearchTransactionThread(firstTransaction, hash, backTo, transactionPreviewData, false);
                    } else {
                        setOptimisticDataForTransactionThreadPreview(firstTransaction, transactionPreviewData);
                    }
                }
                requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo})));
                return;
            }

            if (isReportActionListItemType(item)) {
                const reportActionID = item.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            markReportIDAsExpense(reportID);

            if (isTransactionItem && transactionPreviewData) {
                setOptimisticDataForTransactionThreadPreview(item, transactionPreviewData);
            }

            requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
        },
        [isMobileSelectionModeEnabled, toggleTransaction, hash, queryJSON, handleSearch, searchKey, markReportIDAsExpense],
    );

    const currentColumns = useMemo(() => {
        if (!searchResults?.data) {
            return [];
        }
        const columns = getColumnsToShow(accountID, searchResults?.data, false, searchResults?.search?.type);

        return (Object.keys(columns) as SearchColumnType[]).filter((col) => columns[col]);
    }, [accountID, searchResults?.data, searchResults?.search?.type]);

    const opacity = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
    }));

    const previousColumns = usePrevious(currentColumns);
    const [columnsToShow, setColumnsToShow] = useState<SearchColumnType[]>([]);

    // If columns have changed, trigger an animation before settings columnsToShow to prevent
    // new columns appearing before the fade out animation happens
    useEffect(() => {
        if ((previousColumns && currentColumns && arraysEqual(previousColumns, currentColumns)) || offset === 0 || isSmallScreenWidth) {
            setColumnsToShow(currentColumns);
            return;
        }

        opacity.set(
            withTiming(0, {duration: CONST.SEARCH.ANIMATION.FADE_DURATION}, () => {
                setColumnsToShow(currentColumns);
                opacity.set(withTiming(1, {duration: CONST.SEARCH.ANIMATION.FADE_DURATION}));
            }),
        );
    }, [previousColumns, currentColumns, setColumnsToShow, opacity, offset, isSmallScreenWidth]);

    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
    const canSelectMultiple = !isChat && !isTask && (!isSmallScreenWidth || isMobileSelectionModeEnabled) && validGroupBy !== CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID;
    const ListItem = getListItem(type, status, validGroupBy);

    const sortedSelectedData = useMemo(
        () =>
            getSortedSections(type, status, filteredData, localeCompare, sortBy, sortOrder, validGroupBy).map((item) => {
                const baseKey = isChat
                    ? `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${(item as ReportActionListItemType).reportActionID}`
                    : `${ONYXKEYS.COLLECTION.TRANSACTION}${(item as TransactionListItemType).transactionID}`;

                // Check if the base key matches the newSearchResultKey (TransactionListItemType)
                const isBaseKeyMatch = !!newSearchResultKeys?.has(baseKey);

                // Check if any transaction within the transactions array (TransactionGroupListItemType) matches the newSearchResultKey
                const isAnyTransactionMatch =
                    !isChat &&
                    (item as TransactionGroupListItemType)?.transactions?.some((transaction) => {
                        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                        return !!newSearchResultKeys?.has(transactionKey);
                    });

                // Determine if either the base key or any transaction key matches
                const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;

                return mapToItemWithAdditionalInfo(item, selectedTransactions, canSelectMultiple, shouldAnimateInHighlight, hash);
            }),
        [type, status, filteredData, sortBy, sortOrder, validGroupBy, isChat, newSearchResultKeys, selectedTransactions, canSelectMultiple, localeCompare, hash],
    );

    useEffect(() => {
        const currentRoute = Navigation.getActiveRouteWithoutParams();
        if (hasErrors && (currentRoute === '/' || (shouldResetSearchQuery && currentRoute === '/search'))) {
            // Use requestAnimationFrame to safely update navigation params without overriding the current route
            requestAnimationFrame(() => {
                Navigation.setParams({q: buildCannedSearchQuery()});
            });
            if (shouldResetSearchQuery) {
                setShouldResetSearchQuery(false);
            }
        }
    }, [hasErrors, queryJSON, searchResults, shouldResetSearchQuery, setShouldResetSearchQuery]);

    const fetchMoreResults = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!isFocused || !searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems || offset > allDataLength - CONST.SEARCH.RESULTS_PAGE_SIZE) {
            return;
        }

        setOffset((prev) => prev + CONST.SEARCH.RESULTS_PAGE_SIZE);
    }, [isFocused, searchResults?.search?.hasMoreResults, shouldShowLoadingMoreItems, shouldShowLoadingState, offset, allDataLength]);

    const toggleAllTransactions = useCallback(() => {
        const areItemsGrouped = !!validGroupBy || isExpenseReportType;
        const totalSelected = Object.keys(selectedTransactions).length;

        if (totalSelected > 0) {
            clearSelectedTransactions();
            return;
        }

        if (areItemsGrouped) {
            setSelectedTransactions(
                Object.fromEntries(
                    (filteredData as TransactionGroupListItemType[]).flatMap((item) =>
                        item.transactions
                            .filter((t) => !isTransactionPendingDelete(t))
                            .map((transactionItem) => mapTransactionItemToSelectedEntry(transactionItem, outstandingReportsByPolicyID)),
                    ),
                ),
                filteredData,
            );

            return;
        }

        setSelectedTransactions(
            Object.fromEntries(
                (filteredData as TransactionListItemType[])
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => mapTransactionItemToSelectedEntry(transactionItem, outstandingReportsByPolicyID)),
            ),
            filteredData,
        );
    }, [clearSelectedTransactions, filteredData, validGroupBy, selectedTransactions, setSelectedTransactions, outstandingReportsByPolicyID, isExpenseReportType]);

    const onLayout = useCallback(() => {
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        handleSelectionListScroll(sortedSelectedData, searchListRef.current);
    }, [handleSelectionListScroll, sortedSelectedData]);

    const areAllOptionalColumnsHidden = useMemo(() => {
        const canBeMissingColumns = expenseHeaders.filter((header) => header.canBeMissing).map((header) => header.columnName);
        return canBeMissingColumns.every((column) => !columnsToShow.includes(column));
    }, [columnsToShow]);

    const onLayoutSkeleton = useCallback(() => {
        endSpan(CONST.TELEMETRY.SPAN_ON_LAYOUT_SKELETON_REPORTS);
    }, []);

    if (shouldShowLoadingState) {
        return (
            <Animated.View
                entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                exiting={FadeOut.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                style={[styles.flex1]}
                onLayout={onLayoutSkeleton}
            >
                <SearchRowSkeleton
                    shouldAnimate
                    containerStyle={shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3}
                />
            </Animated.View>
        );
    }

    if (searchResults === undefined) {
        Log.alert('[Search] Undefined search type');
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    if (hasErrors) {
        const isInvalidQuery = searchRequestResponseStatusCode === CONST.JSON_CODE.INVALID_SEARCH_QUERY;
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <FullPageErrorView
                    shouldShow
                    subtitleStyle={styles.textSupporting}
                    title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
                    subtitle={translate(isInvalidQuery ? 'errorPage.wrongTypeSubtitle' : 'errorPage.subtitle')}
                />
            </View>
        );
    }

    const visibleDataLength = filteredData.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length;
    if (shouldShowEmptyState(isDataLoaded, visibleDataLength, searchResults?.search?.type)) {
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB);
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles : styles.mt3, styles.flex1]}>
                <EmptySearchView
                    similarSearchHash={similarSearchHash}
                    type={type}
                    hasResults={searchResults?.search?.hasResults}
                />
            </View>
        );
    }

    const onSortPress = (column: SearchColumnType, order: SortOrder) => {
        clearSelectedTransactions();
        const newQuery = buildSearchQueryString({...queryJSON, sortBy: column, sortOrder: order});
        onSortPressedCallback?.();
        navigation.setParams({q: newQuery});
    };

    const shouldShowYear = shouldShowYearUtil(searchResults?.data, isExpenseReportType ?? false);
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = getWideAmountIndicators(searchResults?.data);
    const shouldShowSorting = !validGroupBy;
    const shouldShowTableHeader = isLargeScreenWidth && !isChat && !validGroupBy;
    const tableHeaderVisible = (canSelectMultiple || shouldShowTableHeader) && (!validGroupBy || isExpenseReportType);

    return (
        <SearchScopeProvider>
            <Animated.View style={[styles.flex1, animatedStyle]}>
                <SearchList
                    ref={searchListRef}
                    data={sortedSelectedData}
                    ListItem={ListItem}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={toggleTransaction}
                    onAllCheckboxPress={toggleAllTransactions}
                    canSelectMultiple={canSelectMultiple}
                    shouldPreventLongPressRow={isChat || isTask}
                    isFocused={isFocused}
                    onDEWModalOpen={handleDEWModalOpen}
                    SearchTableHeader={
                        !shouldShowTableHeader ? undefined : (
                            <View style={[!isTask && styles.pr8, styles.flex1]}>
                                <SearchTableHeader
                                    canSelectMultiple={canSelectMultiple}
                                    columns={columnsToShow}
                                    type={type}
                                    onSortPress={onSortPress}
                                    sortOrder={sortOrder}
                                    sortBy={sortBy}
                                    shouldShowYear={shouldShowYear}
                                    isAmountColumnWide={shouldShowAmountInWideColumn}
                                    isTaxAmountColumnWide={shouldShowTaxAmountInWideColumn}
                                    shouldShowSorting={shouldShowSorting}
                                    areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                                    groupBy={validGroupBy}
                                />
                            </View>
                        )
                    }
                    contentContainerStyle={[styles.pb3, contentContainerStyle]}
                    containerStyle={[styles.pv0, !tableHeaderVisible && !isSmallScreenWidth && styles.pt3]}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onScroll={onSearchListScroll}
                    onEndReachedThreshold={0.75}
                    onEndReached={fetchMoreResults}
                    ListFooterComponent={
                        shouldShowLoadingMoreItems ? (
                            <SearchRowSkeleton
                                shouldAnimate
                                fixedNumItems={5}
                            />
                        ) : undefined
                    }
                    queryJSON={queryJSON}
                    columns={columnsToShow}
                    areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                    violations={filteredViolations}
                    onLayout={onLayout}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    shouldAnimate={type === CONST.SEARCH.DATA_TYPES.EXPENSE}
                    newTransactions={newTransactions}
                />
                <ConfirmModal
                    title={translate('customApprovalWorkflow.title')}
                    isVisible={isDEWModalVisible}
                    onConfirm={() => {
                        setIsDEWModalVisible(false);
                        openOldDotLink(CONST.OLDDOT_URLS.INBOX);
                    }}
                    onCancel={() => setIsDEWModalVisible(false)}
                    prompt={translate('customApprovalWorkflow.description')}
                    confirmText={translate('customApprovalWorkflow.goToExpensifyClassic')}
                    shouldShowCancelButton={false}
                />
            </Animated.View>
        </SearchScopeProvider>
    );
}

Search.displayName = 'Search';

export type {SearchProps};
const WrappedSearch = Sentry.withProfiler(Search) as typeof Search;
WrappedSearch.displayName = 'Search';
export default WrappedSearch;
