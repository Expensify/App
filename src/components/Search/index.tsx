import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import type {SelectionListHandle} from '@components/SelectionList/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {setOptimisticDataForTransactionThreadPreview} from '@libs/actions/Search';
import {flushDeferredWrite, getOptimisticWatchKey, hasDeferredWrite} from '@libs/deferredLayoutWrite';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isCreatedTaskReportAction} from '@libs/ReportActionsUtils';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {canEditFieldOfMoneyRequest, canHoldUnholdReportAction, canRejectReportAction, isOneTransactionReport, selectFilteredReportActions} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryString, isDefaultExpensesQuery} from '@libs/SearchQueryUtils';
import {
    createAndOpenSearchTransactionThread,
    doesSearchItemMatchSort,
    getColumnsToShow,
    getListItem,
    getSections,
    getSortedSections,
    getValidGroupBy,
    getWideAmountIndicators,
    isGroupedItemArray,
    isReportActionListItemType,
    isSearchDataLoaded,
    isSearchResultsEmpty as isSearchResultsEmptyUtil,
    isTaskListItemType,
    isTransactionGroupListItemType,
    isTransactionListItemType,
    isTransactionReportGroupListItemType,
    shouldShowEmptyState,
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {cancelSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isOnHold, isTransactionPendingDelete} from '@libs/TransactionUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {OutstandingReportsByPolicyIDDerivedValue, SaveSearch, Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arraysEqual from '@src/utils/arraysEqual';
import SearchChartView from './SearchChartView';
import SearchChartWrapper from './SearchChartWrapper';
import {useSearchActionsContext, useSearchStateContext} from './SearchContext';
import SearchList from './SearchList';
import type {ReportActionListItemType, SearchListItem, TransactionGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from './SearchList/ListItem/types';
import {SearchScopeProvider} from './SearchScopeProvider';
import SearchTableHeader from './SearchTableHeader';
import type {SearchColumnType, SearchParams, SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

type SearchProps = {
    queryJSON: SearchQueryJSON;
    hasFilterBars?: boolean;
    onSearchListScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    searchResults?: SearchResults;
    handleSearch: (value: SearchParams) => void;
    onSortPressedCallback?: () => void;
    isMobileSelectionModeEnabled: boolean;
    searchRequestResponseStatusCode?: number | null;
    onContentReady?: () => void;

    /** Callback from the parent (SearchPageNarrow) to end submit-expense navigation spans.
     *  Consolidates span-ending logic in one place. Accepts `wasListEmpty` for telemetry attributes. */
    onDestinationVisible?: (wasListEmpty: boolean, source: 'focus' | 'layout') => void;
};

// Max time (ms) to keep the optimistic item cache/skeleton alive before
// clearing all tracking state. Must be longer than deferredLayoutWrite's
// 5s safety timeout so the API.write() has time to apply optimistic data.
const OPTIMISTIC_TRACKING_TIMEOUT_MS = 10_000;

// Grace period (ms) before clearing optimistic tracking after a cached item
// disappears from sortedData. Short enough to clean up rolled-back items,
// long enough to survive a brief stale-snapshot gap.
const OPTIMISTIC_ROLLBACK_GRACE_MS = OPTIMISTIC_TRACKING_TIMEOUT_MS * 0.3;

const hashToString = (queryHash?: number) => (queryHash || queryHash === 0 ? String(queryHash) : undefined);

function mapTransactionItemToSelectedEntry(
    item: TransactionListItemType,
    itemTransaction: OnyxEntry<Transaction>,
    originalItemTransaction: OnyxEntry<Transaction>,
    currentUserLogin: string,
    currentUserAccountID: number,
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
    allowNegativeAmount = true,
): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy, currentUserAccountID);
    const canRejectRequest = item.report ? canRejectReportAction(currentUserLogin, item.report) : false;
    const amount = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : item.amount;

    return [
        item.keyForList,
        {
            transaction: item,
            isSelected: true,
            canReject: canRejectRequest,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canSplit: isSplitAction(item.report, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, item.policy),
            hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
            canChangeReport: canEditFieldOfMoneyRequest({
                reportAction: item.reportAction,
                fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                outstandingReportsByPolicyID,
                transaction: item,
                report: item.report,
                policy: item.policy,
            }),
            action: item.action,
            groupCurrency: item.groupCurrency,
            groupExchangeRate: item.groupExchangeRate,
            currencyConversionRate: item.currencyConversionRate,
            reportID: item.reportID,
            policyID: item.policyID,
            amount: allowNegativeAmount ? amount : Math.abs(amount),
            groupAmount: item.groupAmount,
            currency: item.currency,
            isFromOneTransactionReport: isOneTransactionReport(item.report),
            ownerAccountID: item.reportAction?.actorAccountID,
            reportAction: item.reportAction,
            report: item.report,
        },
    ];
}

function mapEmptyReportToSelectedEntry(item: TransactionReportGroupListItemType): [string, SelectedTransactionInfo] {
    return [
        item.keyForList ?? '',
        {
            isFromOneTransactionReport: false,
            isSelected: true,
            canHold: false,
            canSplit: false,
            canReject: false,
            hasBeenSplit: false,
            isHeld: false,
            canUnhold: false,
            canChangeReport: false,
            action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: item.reportID,
            policyID: item.policyID ?? CONST.POLICY.ID_FAKE,
            amount: 0,
            currency: '',
        },
    ];
}

function prepareTransactionsList(
    item: TransactionListItemType,
    itemTransaction: OnyxEntry<Transaction>,
    originalItemTransaction: OnyxEntry<Transaction>,
    selectedTransactions: SelectedTransactions,
    currentUserLogin: string,
    currentUserAccountID: number,
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
) {
    if (selectedTransactions[item.keyForList]?.isSelected) {
        const {[item.keyForList]: omittedTransaction, ...transactions} = selectedTransactions;

        return transactions;
    }

    const [key, selectedInfo] = mapTransactionItemToSelectedEntry(
        item,
        itemTransaction,
        originalItemTransaction,
        currentUserLogin,
        currentUserAccountID,
        outstandingReportsByPolicyID,
        false,
    );

    return {
        ...selectedTransactions,
        [key]: selectedInfo,
    };
}

function Search({
    queryJSON,
    hasFilterBars,
    searchResults,
    onSearchListScroll,
    contentContainerStyle,
    handleSearch,
    isMobileSelectionModeEnabled,
    onSortPressedCallback,
    searchRequestResponseStatusCode,
    onContentReady,
    onDestinationVisible,
}: SearchProps) {
    const {type, status, sortBy, sortOrder, hash, similarSearchHash, groupBy, view} = queryJSON;
    // Deferred write: API.write() is postponed so the skeleton renders instantly.
    // Once flushed, we cache the optimistic item from sortedData and re-inject it
    // via stableSortedData if a stale snapshot briefly removes it. The cache is
    // cleared when the server-confirmed version arrives (pendingAction !== ADD).
    const hasPendingWriteOnMountRef = useRef(hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH));
    const optimisticWatchKeyRef = useRef(getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH));
    const skipDeferralOnFocusRef = useRef(isSearchDataLoaded(searchResults, queryJSON) && !hasPendingWriteOnMountRef.current);

    const [shouldDeferHeavySearchWork, setShouldDeferHeavySearchWork] = useState(() => !isSearchDataLoaded(searchResults, queryJSON) || hasPendingWriteOnMountRef.current);
    const [showPendingExpensePlaceholder, setShowPendingExpensePlaceholder] = useState(() => hasPendingWriteOnMountRef.current);
    // Caches the optimistic list item once it first appears in sortedData.
    // Used by stableSortedData to re-inject the row if a stale snapshot temporarily removes it.
    // Cleared once the server-confirmed (non-optimistic) version arrives.
    const cachedOptimisticItemRef = useRef<TransactionListItemType | null>(null);
    const cachedOptimisticItemIndexRef = useRef(0);
    const optimisticTrackingCleanedUpRef = useRef(false);
    const rollbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [isOptimisticTrackingCleared, setIsOptimisticTrackingCleared] = useState(false);

    const clearOptimisticTracking = useCallback(() => {
        if (optimisticTrackingCleanedUpRef.current) {
            return;
        }
        optimisticTrackingCleanedUpRef.current = true;
        cachedOptimisticItemRef.current = null;
        optimisticWatchKeyRef.current = undefined;
        setShowPendingExpensePlaceholder(false);
        setIsOptimisticTrackingCleared(true);
    }, []);

    // Safety timeout: if the optimistic lifecycle hasn't resolved within 10s
    // (e.g. API failure, offline, item never reaches sortedData), clear the
    // skeleton placeholder so the UI doesn't get stuck. The stableSortedData
    // cache (cachedOptimisticItemRef) is intentionally kept alive so the item
    // stays visible at its sorted position until server-confirmed data arrives;
    // clearOptimisticTracking handles that cleanup when pendingAction !== ADD.
    useEffect(() => {
        if (!hasPendingWriteOnMountRef.current) {
            return;
        }
        const id = setTimeout(() => setShowPendingExpensePlaceholder(false), OPTIMISTIC_TRACKING_TIMEOUT_MS);
        return () => clearTimeout(id);
    }, []);

    // Flush (not cancel) on unmount so the API.write() still executes if the
    // user navigates away before onLayout fires. This also clears the channel,
    // preventing a stale hasDeferredWrite() on the next mount.
    useEffect(
        () => () => {
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            if (rollbackTimeoutRef.current) {
                clearTimeout(rollbackTimeoutRef.current);
            }
        },
        [],
    );

    const {isOffline} = useNetwork();
    const prevIsOffline = usePrevious(isOffline);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isLargeScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const isFocused = useIsFocused();
    const {markReportIDAsExpense, markReportIDAsMultiTransactionExpense, unmarkReportIDAsMultiTransactionExpense} = useWideRHPActions();
    const {
        currentSearchHash,
        currentSearchKey,
        selectedTransactions,
        shouldTurnOffSelectionMode,
        lastSearchType,
        areAllMatchingItemsSelected,
        shouldResetSearchQuery,
        shouldUseLiveData,
        suggestedSearches,
    } = useSearchStateContext();

    const {setSelectedTransactions, clearSelectedTransactions, setShouldShowFiltersBarLoading, setShouldShowSelectAllMatchingItems, selectAllMatchingItems, setShouldResetSearchQuery} =
        useSearchActionsContext();
    const [offset, setOffset] = useState(0);

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isExpenseReportType = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const archivedReportsIdSet = useArchivedReportsIdSet();

    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        selector: selectFilteredReportActions,
    });

    const {policyForMovingExpenses} = usePolicyForMovingExpenses();

    const [cardFeeds, cardFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [onyxPersonalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const searchDataType = useMemo(() => (shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type), [shouldUseLiveData, searchResults?.search?.type]);
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, hash, offset === 0);

    const previousReportActions = usePrevious(reportActions);
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const searchListRef = useRef<SelectionListHandle<SearchListItem> | null>(null);

    const savedSearchSelector = useCallback((searches: OnyxEntry<SaveSearch>) => searches?.[hash], [hash]);
    const [savedSearch] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {
        selector: savedSearchSelector,
    });

    const validGroupBy = getValidGroupBy(groupBy);
    const prevValidGroupBy = usePrevious(validGroupBy);
    const isSearchResultsEmpty = !searchResults?.data || isSearchResultsEmptyUtil(searchResults, validGroupBy);
    const isSearchResultsEmptyRef = useRef(isSearchResultsEmpty);
    isSearchResultsEmptyRef.current = isSearchResultsEmpty;

    // When grouping by card, we need cardFeeds to display feed names
    const isCardFeedsLoading = validGroupBy === CONST.SEARCH.GROUP_BY.CARD && cardFeedsResult?.status === 'loading';

    useEffect(() => {
        if (prevValidGroupBy === validGroupBy) {
            return;
        }
        clearSelectedTransactions();
    }, [validGroupBy, prevValidGroupBy, clearSelectedTransactions]);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const selectedKeys = Object.keys(selectedTransactions).filter((transactionKey) => selectedTransactions[transactionKey]);
        if (selectedKeys.length === 0 && isMobileSelectionModeEnabled && shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }

        // We don't want to run the effect on isFocused change as we only need it to early return when it is false.
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

        // We only want this effect to handle the switching of mobile selection mode state when screen size changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth]);

    const {newSearchResultKeys, handleSelectionListScroll, newTransactions} = useSearchHighlightAndScroll({
        searchResults,
        transactions,
        previousTransactions,
        queryJSON,
        searchKey: currentSearchKey,
        offset,
        shouldCalculateTotals,
        reportActions,
        previousReportActions,
        shouldUseLiveData,
    });

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    const deferHeavySearchWork = useCallback((useDoubleFrame = false) => {
        setShouldDeferHeavySearchWork(true);

        // Search can do a lot of synchronous grouping/sorting work. Deferring by one frame keeps
        // normal query transitions responsive, while two frames gives the submit-to-search route a
        // chance to paint the first post-navigation frame before we start the heavier transforms.
        let secondFrameID: number | undefined;
        const frameID = requestAnimationFrame(() => {
            if (!useDoubleFrame) {
                setShouldDeferHeavySearchWork(false);
                return;
            }

            secondFrameID = requestAnimationFrame(() => setShouldDeferHeavySearchWork(false));
        });

        return () => {
            cancelAnimationFrame(frameID);
            if (secondFrameID) {
                cancelAnimationFrame(secondFrameID);
            }
        };
    }, []);

    // Only defer heavy work (getSections) when data isn't available yet.
    // Skipping the defer for live data (to-dos) and cached results avoids a
    // flash of the empty state or a blank page caused by a redundant defer cycle.
    useEffect(() => {
        if (isDataLoaded) {
            setShouldDeferHeavySearchWork(false);
            return;
        }
        return deferHeavySearchWork();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, deferHeavySearchWork, isDataLoaded]);

    useFocusEffect(
        useCallback(() => {
            const pendingSubmitFollowUpAction = getPendingSubmitFollowUpAction();
            const isPendingSearchNavigation = pendingSubmitFollowUpAction?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH;

            if (!isPendingSearchNavigation) {
                return;
            }

            if (skipDeferralOnFocusRef.current) {
                skipDeferralOnFocusRef.current = false;
                return;
            }

            return deferHeavySearchWork(true);
        }, [deferHeavySearchWork]),
    );

    const [skeletonWasDisplayed, setSkeletonWasDisplayed] = useState(false);
    const onSkeletonLayout = useCallback(() => setSkeletonWasDisplayed(true), []);
    const deferredWorkReasonAttributes = useMemo(() => ({context: 'Search.DeferredWork'}) as const, []);
    const pendingExpenseReasonAttributes = useMemo(() => ({context: 'Search.PendingExpensePlaceholder'}) as const, []);

    // Show a skeleton whenever heavy work is deferred, even for live-data (to-do) searches,
    // so we never fall through to the empty-state check with stale zero-length data.
    const isDeferringHeavyWork = !isOffline && shouldDeferHeavySearchWork;
    const isSearchLoadingWithNoResults = !!searchResults?.search?.isLoading && Array.isArray(searchResults?.data) && searchResults?.data.length === 0;
    const hasUnresolvedErrors = hasErrors && searchRequestResponseStatusCode === null;
    const isWaitingForInitialData = !shouldUseLiveData && !isOffline && (!isDataLoaded || isSearchLoadingWithNoResults || hasUnresolvedErrors || isCardFeedsLoading);
    const shouldShowLoadingState = isDeferringHeavyWork || isWaitingForInitialData;
    const shouldShowRowSkeleton = (!skeletonWasDisplayed || shouldShowLoadingState) && hasPendingWriteOnMountRef.current && !hasErrors;

    const shouldShowLoadingMoreItems = !shouldShowLoadingState && searchResults?.search?.isLoading && searchResults?.search?.offset > 0;

    const loadMoreSkeletonReasonAttributes = useMemo<SkeletonSpanReasonAttributes>(
        () => ({
            context: 'Search.ListFooter',
            isSearchLoading: !!searchResults?.search?.isLoading,
            searchOffset: searchResults?.search?.offset ?? 0,
        }),
        [searchResults?.search?.isLoading, searchResults?.search?.offset],
    );

    const prevIsSearchResultEmpty = usePrevious(isSearchResultsEmpty);

    const {baseFilteredData, filteredDataLength, allDataLength, hasDeletedTransaction} = useMemo(() => {
        if (shouldDeferHeavySearchWork || searchResults === undefined || !isDataLoaded || !searchResults.data) {
            return {baseFilteredData: [], filteredDataLength: 0, allDataLength: 0, hasDeletedTransaction: false};
        }

        // Group-by option cannot be used for chats or tasks
        const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
        const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
        if (validGroupBy && (isChat || isTask)) {
            return {baseFilteredData: [], filteredDataLength: 0, allDataLength: 0, hasDeletedTransaction: false};
        }

        const [filteredData1, allLength, hasDeletedTransactionFromSections] = getSections({
            type,
            data: searchResults.data,
            policies,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            translate,
            formatPhoneNumber,
            bankAccountList,
            groupBy: validGroupBy,
            reportActions: exportReportActions,
            currentSearch: currentSearchKey,
            archivedReportsIDList: archivedReportsIdSet,
            queryJSON,
            isActionLoadingSet,
            cardFeeds,
            isOffline,
            allTransactionViolations: violations,
            customCardNames,
            allReportMetadata,
            conciergeReportID,
            onyxPersonalDetailsList,
            policyForMovingExpenses,
        });
        return {
            baseFilteredData: filteredData1,
            filteredDataLength: filteredData1.length,
            allDataLength: allLength,
            hasDeletedTransaction: hasDeletedTransactionFromSections,
        };
    }, [
        currentSearchKey,
        isOffline,
        exportReportActions,
        validGroupBy,
        isDataLoaded,
        shouldDeferHeavySearchWork,
        searchResults,
        type,
        archivedReportsIdSet,
        translate,
        formatPhoneNumber,
        accountID,
        queryJSON,
        email,
        isActionLoadingSet,
        cardFeeds,
        policies,
        bankAccountList,
        violations,
        customCardNames,
        allReportMetadata,
        conciergeReportID,
        onyxPersonalDetailsList,
        policyForMovingExpenses,
    ]);

    // For group-by views, each grouped item has a transactionsQueryJSON with a hash pointing to a separate snapshot
    // containing its individual transactions. We collect these hashes and fetch their snapshots to enrich the grouped items.
    const groupByTransactionHashes = useMemo(() => {
        if (!validGroupBy) {
            return [];
        }
        return (baseFilteredData as TransactionGroupListItemType[]).map((item) => hashToString(item.transactionsQueryJSON?.hash)).filter((hashValue): hashValue is string => !!hashValue);
    }, [validGroupBy, baseFilteredData]);

    const groupByTransactionSnapshots = useMultipleSnapshots(groupByTransactionHashes);

    const filteredData = useMemo(() => {
        if (shouldDeferHeavySearchWork || !validGroupBy || isExpenseReportType) {
            return baseFilteredData;
        }

        const enriched = (baseFilteredData as TransactionGroupListItemType[]).map((item) => {
            const snapshot = groupByTransactionSnapshots[hashToString(item.transactionsQueryJSON?.hash) ?? ''];
            if (!snapshot?.data) {
                return item;
            }

            const [transactions1] = getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: snapshot.data,
                currentAccountID: accountID,
                currentUserEmail: email ?? '',
                bankAccountList,
                translate,
                formatPhoneNumber,
                isActionLoadingSet,
                cardFeeds,
                allReportMetadata,
                conciergeReportID,
            });
            return {
                ...item,
                transactions: transactions1 as TransactionListItemType[],
            };
        });

        return enriched;
    }, [
        validGroupBy,
        isExpenseReportType,
        shouldDeferHeavySearchWork,
        baseFilteredData,
        groupByTransactionSnapshots,
        accountID,
        email,
        translate,
        formatPhoneNumber,
        isActionLoadingSet,
        cardFeeds,
        bankAccountList,
        allReportMetadata,
        conciergeReportID,
    ]);

    const hasLoadedAllTransactions = useMemo(() => {
        if (!validGroupBy) {
            return true;
        }
        // For group-by views, check if all transactions in groups have been loaded
        return (baseFilteredData as TransactionGroupListItemType[]).every((item) => {
            const snapshot = item.transactionsQueryJSON?.hash || item.transactionsQueryJSON?.hash === 0 ? groupByTransactionSnapshots[String(item.transactionsQueryJSON.hash)] : undefined;
            // If snapshot doesn't exist, the group hasn't been expanded yet (transactions not loaded)
            // If snapshot exists and has hasMoreResults: true, not all transactions are loaded
            return !!snapshot && !snapshot?.search?.hasMoreResults;
        });
    }, [validGroupBy, baseFilteredData, groupByTransactionSnapshots]);

    useEffect(() => {
        if (!shouldShowLoadingState) {
            return;
        }

        Log.info('[Search] Showing skeleton', false, {isOffline, isDataLoaded, isCardFeedsLoading, isSearchLoading: !!searchResults?.search?.isLoading, hasErrors, shouldUseLiveData});
    }, [hasErrors, isCardFeedsLoading, isDataLoaded, isOffline, searchResults?.search?.isLoading, shouldShowLoadingState, shouldUseLiveData]);

    useEffect(() => {
        /** We only want to display the skeleton for the status filters the first time we load them for a specific data type */
        setShouldShowFiltersBarLoading(shouldShowLoadingState && lastSearchType !== type);
    }, [lastSearchType, setShouldShowFiltersBarLoading, shouldShowLoadingState, type]);

    const shouldRetrySearchWithTotalsOrGroupedRef = useRef(false);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        const isMigratedModalDisplayed = focusedRoute?.name === NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR || focusedRoute?.name === SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT;

        const comingBackOnlineWithNoResults = prevIsOffline && !isOffline && isEmptyObject(searchResults?.data);
        if (!comingBackOnlineWithNoResults && ((!isFocused && !isMigratedModalDisplayed) || isOffline)) {
            return;
        }

        // When mounting after the pre-insert fast path, the deferred write hasn't
        // been flushed yet. Triggering a search now would race with the CREATE
        // API call and return stale results that overwrite the optimistic row.
        // Skip this call; the optimistic data from flushDeferredWrite will populate
        // the list, and the next user-driven search will refresh from the server.
        if (hasPendingWriteOnMountRef.current && hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
            return;
        }

        if (searchResults?.search?.isLoading) {
            if (validGroupBy || (shouldCalculateTotals && searchResults?.search?.count === undefined)) {
                shouldRetrySearchWithTotalsOrGroupedRef.current = true;
            }
            return;
        }

        handleSearch({
            queryJSON,
            searchKey: currentSearchKey,
            offset,
            shouldCalculateTotals,
            prevReportsLength: filteredDataLength,
            isLoading: !!searchResults?.search?.isLoading,
        });

        // We don't need to run the effect on change of isFocused.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSearch, isOffline, offset, queryJSON, currentSearchKey, shouldCalculateTotals, validGroupBy]);

    useEffect(() => {
        if (!shouldRetrySearchWithTotalsOrGroupedRef.current || searchResults?.search?.isLoading || (!shouldCalculateTotals && !validGroupBy)) {
            return;
        }

        // If count is already present, the latest response already contains totals and we can skip the re-query.
        // If we show grouped values we want to retry search either way, the data may be outdated e.g. after deleting an expense.
        if (!validGroupBy && searchResults?.search?.count !== undefined) {
            shouldRetrySearchWithTotalsOrGroupedRef.current = false;
            return;
        }

        shouldRetrySearchWithTotalsOrGroupedRef.current = false;
        handleSearch({
            queryJSON,
            searchKey: currentSearchKey,
            offset,
            shouldCalculateTotals: true,
            prevReportsLength: filteredDataLength,
            isLoading: false,
        });
    }, [filteredDataLength, handleSearch, offset, queryJSON, currentSearchKey, searchResults?.search?.count, searchResults?.search?.isLoading, shouldCalculateTotals, validGroupBy]);

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

                if (transactionGroup.transactions.length === 0 && isTransactionReportGroupListItemType(transactionGroup)) {
                    const reportKey = transactionGroup.keyForList;
                    if (transactionGroup.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        continue;
                    }
                    if (reportKey && (reportKey in selectedTransactions || areAllMatchingItemsSelected)) {
                        const [, emptyReportSelection] = mapEmptyReportToSelectedEntry(transactionGroup);
                        newTransactionList[reportKey] = {
                            ...emptyReportSelection,
                            isSelected: areAllMatchingItemsSelected || selectedTransactions[reportKey]?.isSelected,
                        };
                    }
                    continue;
                }

                // For expense reports: when ANY transaction is selected, we want ALL transactions in the report selected.
                // This ensures report-level selection persists when new transactions are added.
                // Also check if the report itself was selected (when it was empty) by checking the reportID key
                const reportKey = transactionGroup.keyForList;
                const wasReportSelected = reportKey && reportKey in selectedTransactions;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                const hasAnySelected = isExpenseReportType && (wasReportSelected || transactionGroup.transactions.some((transaction) => transaction.transactionID in selectedTransactions));

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
                        accountID,
                    );
                    const canRejectRequest = email && transactionItem.report ? canRejectReportAction(email, transactionItem.report) : false;

                    const itemTransaction = (searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                    const originalItemTransaction =
                        searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                        transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];

                    newTransactionList[transactionItem.transactionID] = {
                        transaction: transactionItem,
                        action: transactionItem.action,
                        canHold: canHoldRequest,
                        isHeld: isOnHold(transactionItem),
                        canUnhold: canUnholdRequest,
                        canSplit: isSplitAction(transactionItem.report, [itemTransaction], originalItemTransaction, login ?? '', accountID, transactionItem.policy),
                        hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                        canChangeReport: canEditFieldOfMoneyRequest({
                            reportAction: transactionItem.reportAction,
                            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                            outstandingReportsByPolicyID,
                            transaction: transactionItem,
                            report: transactionItem.report,
                            policy: transactionItem.policy,
                        }),
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isSelected: areAllMatchingItemsSelected || selectedTransactions[transactionItem.transactionID]?.isSelected || isExpenseReportType,
                        canReject: canRejectRequest,
                        reportID: transactionItem.reportID,
                        policyID: transactionItem.report?.policyID,
                        amount: hasValidModifiedAmount(transactionItem) ? Number(transactionItem.modifiedAmount) : transactionItem.amount,
                        groupAmount: transactionItem.groupAmount,
                        groupCurrency: transactionItem.groupCurrency,
                        groupExchangeRate: transactionItem.groupExchangeRate,
                        currencyConversionRate: transactionItem.currencyConversionRate,
                        currency: transactionItem.currency,
                        ownerAccountID: transactionItem.reportAction?.actorAccountID,
                        reportAction: transactionItem.reportAction,
                        isFromOneTransactionReport: isOneTransactionReport(transactionItem.report),
                        report: transactionItem.report,
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
                    accountID,
                );
                const canRejectRequest = email && transactionItem.report ? canRejectReportAction(email, transactionItem.report) : false;

                const itemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                const originalItemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];

                newTransactionList[transactionItem.transactionID] = {
                    transaction: transactionItem,
                    action: transactionItem.action,
                    canHold: canHoldRequest,
                    isHeld: isOnHold(transactionItem),
                    canUnhold: canUnholdRequest,
                    canSplit: isSplitAction(transactionItem.report, [itemTransaction], originalItemTransaction, login ?? '', accountID, transactionItem.policy),
                    hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                    canChangeReport: canEditFieldOfMoneyRequest({
                        reportAction: transactionItem.reportAction,
                        fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                        outstandingReportsByPolicyID,
                        transaction: transactionItem,
                        report: transactionItem.report,
                        policy: transactionItem.policy,
                    }),
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isSelected: areAllMatchingItemsSelected || selectedTransactions[transactionItem.transactionID].isSelected,
                    canReject: canRejectRequest,
                    reportID: transactionItem.reportID,
                    policyID: transactionItem.report?.policyID,
                    amount: hasValidModifiedAmount(transactionItem) ? Number(transactionItem.modifiedAmount) : transactionItem.amount,
                    groupAmount: transactionItem.groupAmount,
                    groupCurrency: transactionItem.groupCurrency,
                    groupExchangeRate: transactionItem.groupExchangeRate,
                    currencyConversionRate: transactionItem.currencyConversionRate,
                    currency: transactionItem.currency,
                    ownerAccountID: transactionItem.reportAction?.actorAccountID,
                    reportAction: transactionItem.reportAction,
                    isFromOneTransactionReport: isOneTransactionReport(transactionItem.report),
                    report: transactionItem.report,
                };
            }
        }
        if (isEmptyObject(newTransactionList) && Object.keys(selectedTransactions).length === 0) {
            return;
        }

        setSelectedTransactions(newTransactionList, filteredData);

        isRefreshingSelection.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, setSelectedTransactions, areAllMatchingItemsSelected, isFocused, outstandingReportsByPolicyID, isExpenseReportType]);

    useEffect(() => {
        if (!isSearchResultsEmpty || prevIsSearchResultEmpty) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [isSearchResultsEmpty, prevIsSearchResultEmpty]);

    const isUnmounted = useRef(false);
    const hasHadFirstLayout = useRef(false);
    const navigateToReportsSpanOnMount = useRef(getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS));

    useEffect(
        () => () => {
            isUnmounted.current = true;

            if (hasHadFirstLayout.current) {
                return;
            }

            const activeNavigateToReportsSpan = getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS);
            if (activeNavigateToReportsSpan !== navigateToReportsSpanOnMount.current) {
                return;
            }

            cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS);
        },
        [],
    );

    useEffect(
        () => () => {
            if (!isFocused && !isUnmounted.current) {
                return;
            }
            if (isSearchTopmostFullScreenRoute() && currentSearchHash === hash) {
                return;
            }
            clearSelectedTransactions();
            turnOffMobileSelectionMode();
        },
        [isFocused, clearSelectedTransactions, hash, currentSearchHash],
    );

    // When selectedTransactions is updated, we confirm that selection is refreshed
    useEffect(() => {
        isRefreshingSelection.current = false;
    }, [selectedTransactions]);

    const updateSelectAllMatchingItemsState = useCallback(
        (updatedSelectedTransactions: SelectedTransactions) => {
            if (!filteredData.length || isRefreshingSelection.current) {
                return;
            }
            const areItemsGrouped = !!validGroupBy || type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
            const totalSelectableItemsCount = areItemsGrouped
                ? (filteredData as TransactionGroupListItemType[]).reduce((count, item) => {
                      // For empty reports, count the report itself as a selectable item
                      if (item.transactions.length === 0 && isTransactionReportGroupListItemType(item)) {
                          if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                              return count;
                          }
                          return count + 1;
                      }
                      // For regular reports, count all transactions except pending delete ones
                      const selectableTransactions = item.transactions.filter((transaction) => !isTransactionPendingDelete(transaction));
                      return count + selectableTransactions.length;
                  }, 0)
                : filteredData.length;
            const areAllItemsSelected = totalSelectableItemsCount === Object.keys(updatedSelectedTransactions).length;

            // If the user has selected all the expenses in their view but there are more expenses matched by the search
            // give them the option to select all matching expenses
            setShouldShowSelectAllMatchingItems(!!(areAllItemsSelected && searchResults?.search?.hasMoreResults));
            if (!areAllItemsSelected) {
                selectAllMatchingItems(false);
            }
        },
        [filteredData, validGroupBy, type, searchResults?.search?.hasMoreResults, setShouldShowSelectAllMatchingItems, selectAllMatchingItems],
    );

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
                const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}`] as OnyxEntry<Transaction>;
                const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                const updatedTransactions = prepareTransactionsList(
                    item,
                    itemTransaction,
                    originalItemTransaction,
                    selectedTransactions,
                    email ?? '',
                    accountID,
                    outstandingReportsByPolicyID,
                );
                setSelectedTransactions(updatedTransactions, filteredData);
                updateSelectAllMatchingItemsState(updatedTransactions);
                return;
            }

            const currentTransactions = itemTransactions ?? item.transactions;

            // Handle empty reports - treat the report itself as selectable
            if (currentTransactions.length === 0 && isTransactionReportGroupListItemType(item)) {
                const reportKey = item.keyForList;
                if (!reportKey) {
                    return;
                }

                if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return;
                }

                if (selectedTransactions[reportKey]?.isSelected) {
                    // Deselect the empty report
                    const reducedSelectedTransactions: SelectedTransactions = {
                        ...selectedTransactions,
                    };
                    delete reducedSelectedTransactions[reportKey];
                    setSelectedTransactions(reducedSelectedTransactions, filteredData);
                    updateSelectAllMatchingItemsState(reducedSelectedTransactions);
                    return;
                }

                const [, emptyReportSelection] = mapEmptyReportToSelectedEntry(item);
                const updatedTransactions = {
                    ...selectedTransactions,
                    [reportKey]: emptyReportSelection,
                };
                setSelectedTransactions(updatedTransactions, filteredData);
                updateSelectAllMatchingItemsState(updatedTransactions);
                return;
            }

            if (currentTransactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
                const reducedSelectedTransactions: SelectedTransactions = {
                    ...selectedTransactions,
                };

                for (const transaction of currentTransactions) {
                    delete reducedSelectedTransactions[transaction.keyForList];
                }

                setSelectedTransactions(reducedSelectedTransactions, filteredData);
                updateSelectAllMatchingItemsState(reducedSelectedTransactions);
                return;
            }

            const updatedTransactions = {
                ...selectedTransactions,
                ...Object.fromEntries(
                    currentTransactions
                        .filter((t) => !isTransactionPendingDelete(t))
                        .map((transactionItem) => {
                            const itemTransaction = (searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                                transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                            const originalItemTransaction =
                                searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                                transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                            return mapTransactionItemToSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, email ?? '', accountID, outstandingReportsByPolicyID);
                        }),
                ),
            };
            setSelectedTransactions(updatedTransactions, filteredData);
            updateSelectAllMatchingItemsState(updatedTransactions);
        },
        [selectedTransactions, setSelectedTransactions, filteredData, updateSelectAllMatchingItemsState, transactions, email, accountID, outstandingReportsByPolicyID, searchResults?.data],
    );

    const onSelectRow = useCallback(
        (item: SearchListItem, transactionPreviewData?: TransactionPreviewData) => {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            if (isMobileSelectionModeEnabled) {
                toggleTransaction(item);
                return;
            }

            const isTransactionItem = isTransactionListItemType(item);
            const backTo = Navigation.getActiveRoute();
            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionItem && !item?.reportAction?.childReportID) {
                // If the report is unreported (self DM), we want to open the track expense thread instead of a report with an ID of 0
                const shouldOpenTransactionThread = !isOneTransactionReport(item.report) || item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                createAndOpenSearchTransactionThread(item, introSelected, backTo, email ?? '', accountID, betas, item?.reportAction?.childReportID, undefined, shouldOpenTransactionThread);
                if (shouldOpenTransactionThread) {
                    return;
                }
            }

            if (isTransactionGroupListItemType(item) && !isTransactionReportGroupListItemType(item) && item.transactionsQueryJSON) {
                handleSearch({
                    queryJSON: item.transactionsQueryJSON,
                    searchKey: undefined,
                    offset: 0,
                    shouldCalculateTotals: false,
                    isLoading: false,
                });
                return;
            }

            if (!isTransactionItem && !isReportActionListItemType(item) && !isTaskListItemType(item) && !isTransactionGroupListItemType(item)) {
                return;
            }

            const transactionItem = item as TransactionListItemType;
            const reportActionItem = item as ReportActionListItemType;

            let reportID = transactionItem.reportID ?? reportActionItem.reportID;
            if (isTransactionItem && transactionItem?.reportAction?.childReportID) {
                const isFromSelfDM = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                const isFromOneTransactionReport = isOneTransactionReport(transactionItem.report);

                if (isFromSelfDM || !isFromOneTransactionReport) {
                    reportID = transactionItem?.reportAction?.childReportID;
                }
            }

            if (!reportID) {
                return;
            }

            startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
                name: 'Search',
                op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
            });

            if (isTransactionGroupListItemType(item)) {
                const firstTransaction = item.transactions.at(0);
                if (item.isOneTransactionReport && firstTransaction && transactionPreviewData) {
                    if (!firstTransaction?.reportAction?.childReportID) {
                        createAndOpenSearchTransactionThread(
                            firstTransaction,
                            introSelected,
                            backTo,
                            email ?? '',
                            accountID,
                            betas,
                            firstTransaction?.reportAction?.childReportID,
                            transactionPreviewData,
                            false,
                        );
                    } else {
                        setOptimisticDataForTransactionThreadPreview(firstTransaction, transactionPreviewData, firstTransaction?.reportAction?.childReportID);
                    }
                }

                if (item.transactions.length > 1) {
                    markReportIDAsMultiTransactionExpense(reportID);
                } else {
                    unmarkReportIDAsMultiTransactionExpense(reportID);
                }

                requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo})));
                return;
            }

            if (isReportActionListItemType(item)) {
                // Keep deep-linking for persisted actions, but avoid anchoring to optimistic created-task actions that may not be resolvable offline.
                const isOptimisticCreatedTaskAction = reportActionItem.isOptimisticAction ?? false;
                const shouldSkipReportActionID =
                    isCreatedTaskReportAction(reportActionItem) && (isOptimisticCreatedTaskAction || reportActionItem.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                const reportActionID = shouldSkipReportActionID ? undefined : reportActionItem.reportActionID;
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo}));
                return;
            }

            if (isTaskListItemType(item)) {
                requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
                return;
            }

            markReportIDAsExpense(reportID);

            if (isTransactionItem && transactionPreviewData) {
                setOptimisticDataForTransactionThreadPreview(transactionItem, transactionPreviewData, transactionItem?.reportAction?.childReportID);
            }

            requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
        },
        [
            isMobileSelectionModeEnabled,
            markReportIDAsExpense,
            toggleTransaction,
            handleSearch,
            currentSearchKey,
            markReportIDAsMultiTransactionExpense,
            unmarkReportIDAsMultiTransactionExpense,
            introSelected,
            betas,
            email,
            accountID,
        ],
    );

    const shouldUseStrictDefaultExpenseColumns = currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && isDefaultExpensesQuery(queryJSON);

    const currentColumns = useMemo(() => {
        if (!searchResults?.data) {
            return [];
        }
        return getColumnsToShow({currentAccountID: accountID, data: searchResults?.data, visibleColumns, type: searchDataType, groupBy: validGroupBy, shouldUseStrictDefaultExpenseColumns});
    }, [accountID, searchResults?.data, searchDataType, visibleColumns, validGroupBy, shouldUseStrictDefaultExpenseColumns]);

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
    const canSelectMultiple = !isChat && !isTask && (!isSmallScreenWidth || isMobileSelectionModeEnabled);
    const ListItem = getListItem(type, status, validGroupBy);

    const sortedData = useMemo(
        () =>
            getSortedSections(type, status, filteredData, localeCompare, translate, sortBy, sortOrder, validGroupBy).map((item) => {
                const baseKey = isChat
                    ? `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${(item as ReportActionListItemType).reportActionID}`
                    : `${ONYXKEYS.COLLECTION.TRANSACTION}${(item as TransactionListItemType).transactionID}`;

                const isBaseKeyMatch = !!newSearchResultKeys?.has(baseKey);

                const isAnyTransactionMatch =
                    !isChat &&
                    (item as TransactionGroupListItemType)?.transactions?.some((transaction) => {
                        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                        return !!newSearchResultKeys?.has(transactionKey);
                    });

                const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;

                if (item.shouldAnimateInHighlight === shouldAnimateInHighlight && item.hash === hash) {
                    return item;
                }

                return {...item, shouldAnimateInHighlight, hash};
            }),
        [type, status, filteredData, localeCompare, translate, sortBy, sortOrder, validGroupBy, isChat, newSearchResultKeys, hash],
    );

    // Track the optimistic item through its lifecycle in sortedData.
    // First appearance -> cache it & hide the skeleton.
    // Server confirmed (pendingAction !== ADD) -> clear all tracking.
    // Disappeared after caching (rollback) -> schedule cleanup after grace period.
    useEffect(() => {
        if (!hasPendingWriteOnMountRef.current || optimisticTrackingCleanedUpRef.current) {
            return;
        }

        // The watch key may not be available at mount when the deferred write channel
        // was only reserved (fast path: rAF hasn't fired yet). Try to resolve it lazily
        // on each sortedData change. If data arrives before we ever get a key (e.g. the
        // channel was flushed between renders), clear tracking since the list is populated.
        if (!optimisticWatchKeyRef.current) {
            const latestKey = getOptimisticWatchKey(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            if (latestKey) {
                optimisticWatchKeyRef.current = latestKey;
            } else if (sortedData.length > 0) {
                clearOptimisticTracking();
                return;
            } else {
                return;
            }
        }

        const optimisticItem = sortedData.find(
            (item): item is TransactionListItemType => 'transactionID' in item && `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` === optimisticWatchKeyRef.current,
        );
        if (optimisticItem) {
            if (rollbackTimeoutRef.current) {
                clearTimeout(rollbackTimeoutRef.current);
                rollbackTimeoutRef.current = undefined;
            }
            if (!cachedOptimisticItemRef.current) {
                setShowPendingExpensePlaceholder(false);
            }
            cachedOptimisticItemRef.current = optimisticItem;
            cachedOptimisticItemIndexRef.current = sortedData.indexOf(optimisticItem);

            if (optimisticItem.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                clearOptimisticTracking();
            }
        } else if (cachedOptimisticItemRef.current && !rollbackTimeoutRef.current) {
            rollbackTimeoutRef.current = setTimeout(() => {
                rollbackTimeoutRef.current = undefined;
                clearOptimisticTracking();
            }, OPTIMISTIC_ROLLBACK_GRACE_MS);
        }
    }, [sortedData, clearOptimisticTracking]);

    // Re-inject the cached optimistic item when a stale snapshot temporarily removes it
    // from sortedData. Once the item is back (real data), this is a no-op.
    // Refs are intentionally excluded from deps. The memo doesn't need the cached
    // value during the render where the item IS in sortedData (it passes through).
    // When sortedData later changes (item removed by snapshot), the preceding tracking
    // effect has already populated the ref, so the memo picks up the cached value.
    const stableSortedData = useMemo(() => {
        if (isOptimisticTrackingCleared || !cachedOptimisticItemRef.current || !optimisticWatchKeyRef.current) {
            return sortedData;
        }
        const isStillInList = sortedData.some((item) => 'transactionID' in item && `${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}` === optimisticWatchKeyRef.current);
        if (isStillInList) {
            return sortedData;
        }
        const insertAt = Math.min(cachedOptimisticItemIndexRef.current, sortedData.length);
        const result = [...sortedData];
        result.splice(insertAt, 0, cachedOptimisticItemRef.current);
        return result;
    }, [sortedData, isOptimisticTrackingCleared]);

    useEffect(() => {
        const currentRoute = Navigation.getActiveRouteWithoutParams();
        if (hasErrors && (currentRoute === '/' || (shouldResetSearchQuery && currentRoute === '/search'))) {
            // Use requestAnimationFrame to safely update navigation params without overriding the current route
            requestAnimationFrame(() => {
                // We want to explicitly clear stale rawQuery since it’s only used for manually typed-in queries.
                Navigation.setParams({
                    q: buildCannedSearchQuery(),
                    rawQuery: undefined,
                });
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
            updateSelectAllMatchingItemsState({});
            return;
        }

        let updatedTransactions: SelectedTransactions;
        if (areItemsGrouped) {
            const allSelections: Array<[string, SelectedTransactionInfo]> = (filteredData as TransactionGroupListItemType[]).flatMap((item) => {
                if (item.transactions.length === 0 && isTransactionReportGroupListItemType(item) && item.keyForList) {
                    if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        return [];
                    }
                    return [mapEmptyReportToSelectedEntry(item)];
                }
                return item.transactions
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => {
                        const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                        const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                        return mapTransactionItemToSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, email ?? '', accountID, outstandingReportsByPolicyID);
                    });
            });
            updatedTransactions = Object.fromEntries(allSelections);
        } else {
            // When items are not grouped, data is TransactionListItemType[] not TransactionGroupListItemType[]
            updatedTransactions = Object.fromEntries(
                (filteredData as TransactionListItemType[])
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => {
                        const itemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                        const originalItemTransaction = searchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                        return mapTransactionItemToSelectedEntry(transactionItem, itemTransaction, originalItemTransaction, email ?? '', accountID, outstandingReportsByPolicyID);
                    }),
            );
        }
        setSelectedTransactions(updatedTransactions, filteredData);
        updateSelectAllMatchingItemsState(updatedTransactions);
    }, [
        validGroupBy,
        isExpenseReportType,
        selectedTransactions,
        setSelectedTransactions,
        filteredData,
        updateSelectAllMatchingItemsState,
        clearSelectedTransactions,
        transactions,
        email,
        accountID,
        outstandingReportsByPolicyID,
        searchResults?.data,
    ]);

    const onLayout = useCallback(() => {
        hasHadFirstLayout.current = true;
        onDestinationVisible?.(isSearchResultsEmptyRef.current, 'layout');
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true});
        handleSelectionListScroll(stableSortedData, searchListRef.current);
        flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        onContentReady?.();
    }, [handleSelectionListScroll, stableSortedData, onContentReady, onDestinationVisible]);

    // Must be a ref, not state: cancelNavigationSpans is called during render
    // (inside conditional returns), so using setState would trigger infinite re-renders.
    const didBailToFallbackState = useRef(false);

    const cancelNavigationSpans = useCallback(() => {
        cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS);
        if (getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH) {
            cancelSubmitFollowUpActionSpan();
        }
        didBailToFallbackState.current = true;
        onContentReady?.();
    }, [onContentReady]);

    // When the render bails to an error/empty state, the SelectionList never mounts
    // so its onLayout callback (the primary flush site) never fires. This effect
    // catches that case and flushes immediately after commit. No dependency array
    // is intentional — we need to check after every render since bail-outs happen
    // in conditional returns that can't trigger state-based effects.
    useEffect(() => {
        if (!didBailToFallbackState.current || !hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
            return;
        }
        didBailToFallbackState.current = false;
        flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
    });

    const onLayoutChart = useCallback(() => {
        hasHadFirstLayout.current = true;
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true});
    }, []);

    // On re-visits, react-freeze serves the cached layout — onLayout/onLayoutSkeleton never fire.
    // useFocusEffect fires on unfreeze, which is when the screen becomes visible.
    useFocusEffect(
        useCallback(() => {
            if (!hasHadFirstLayout.current) {
                return;
            }
            onDestinationVisible?.(isSearchResultsEmptyRef.current, 'focus');
            endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {
                [CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: !shouldShowLoadingState,
            });
            // On re-focus (e.g. DISMISS_MODAL_ONLY) onLayout won't re-fire — flush here.
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        }, [shouldShowLoadingState, onDestinationVisible]),
    );

    // Reset before conditional returns. Only cancelNavigationSpans (error/empty paths)
    // sets it to true. Must happen during render since it coordinates with the
    // dep-free useEffect above — see comment on didBailToFallbackState.
    didBailToFallbackState.current = false;

    const isAnyVisibleActionLoading = useMemo(
        () => filteredData.some((item) => 'reportID' in item && item.reportID && isActionLoadingSet.has(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${item.reportID}`)),
        [filteredData, isActionLoadingSet],
    );

    const visibleDataLength = useMemo(() => filteredData.filter((item) => item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline).length, [filteredData, isOffline]);

    const yearIndicators = useMemo(
        () =>
            searchResults?.data
                ? shouldShowYearUtil(searchResults.data, isExpenseReportType ?? false, undefined, type === CONST.SEARCH.DATA_TYPES.EXPENSE)
                : {
                      shouldShowYearCreated: false,
                      shouldShowYearSubmitted: false,
                      shouldShowYearApproved: false,
                      shouldShowYearPosted: false,
                      shouldShowYearExported: false,
                      shouldShowYearWithdrawn: false,
                  },
        [searchResults?.data, isExpenseReportType, type],
    );

    const amountIndicators = useMemo(
        () => (searchResults?.data ? getWideAmountIndicators(searchResults.data) : {shouldShowAmountInWideColumn: false, shouldShowTaxAmountInWideColumn: false}),
        [searchResults?.data],
    );

    const onSortPress = useCallback(
        (column: SearchColumnType, order: SortOrder) => {
            clearSelectedTransactions();
            const newQuery = buildSearchQueryString({
                ...queryJSON,
                sortBy: column,
                sortOrder: order,
            });
            onSortPressedCallback?.();
            navigation.setParams({q: newQuery, rawQuery: undefined});
        },
        [clearSelectedTransactions, queryJSON, onSortPressedCallback, navigation],
    );

    // This is a performance optimization for the submit-expense->search path only.
    // The SearchPage skeleton (useSearchLoadingState) doesn't cover this case because
    // Search must mount for its onLayout to flush the deferred CreateMoneyRequest API write, which would block the JS thread causing a slowdown on post expense creation navigation
    if (shouldShowRowSkeleton) {
        return (
            <SearchRowSkeleton
                shouldAnimate
                onLayout={onSkeletonLayout}
                containerStyle={shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!hasFilterBars) : styles.mt3}
                reasonAttributes={deferredWorkReasonAttributes}
            />
        );
    }

    if (searchResults === undefined) {
        Log.alert('[Search] Undefined search type');
        cancelNavigationSpans();
        return <FullPageOfflineBlockingView>{null}</FullPageOfflineBlockingView>;
    }

    if (hasErrors) {
        const isInvalidQuery = searchRequestResponseStatusCode === CONST.JSON_CODE.INVALID_SEARCH_QUERY;
        cancelNavigationSpans();
        return (
            <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!hasFilterBars) : styles.mt3, styles.flex1]}>
                <FullPageErrorView
                    shouldShow
                    containerStyle={styles.searchBlockingErrorViewContainer}
                    subtitleStyle={styles.textSupporting}
                    title={translate('errorPage.title', {
                        isBreakLine: shouldUseNarrowLayout,
                    })}
                    subtitle={translate(isInvalidQuery ? 'errorPage.wrongTypeSubtitle' : 'errorPage.subtitle')}
                />
            </View>
        );
    }
    // Guard: don't render the empty view while the data is transiently empty.
    // - shouldDeferHeavySearchWork: skeleton is still showing, data hasn't been computed yet.
    // - showPendingExpensePlaceholder: deferred write hasn't produced the optimistic item yet.
    // - cachedOptimisticItemRef: an optimistic item was seen but a stale snapshot briefly removed it;
    //   stableSortedData will re-inject it, so the list isn't truly empty.
    if (
        !shouldDeferHeavySearchWork &&
        !showPendingExpensePlaceholder &&
        !cachedOptimisticItemRef.current &&
        shouldShowEmptyState(isDataLoaded, visibleDataLength, searchDataType) &&
        !isAnyVisibleActionLoading
    ) {
        cancelNavigationSpans();
        return (
            <View style={[styles.flex1, isInLandscapeMode ? undefined : [shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!hasFilterBars) : styles.mt3]]}>
                <EmptySearchView
                    similarSearchHash={similarSearchHash}
                    type={type}
                    hasResults={searchResults?.search?.hasResults}
                    queryJSON={queryJSON}
                    onScroll={onSearchListScroll}
                    contentContainerStyle={isInLandscapeMode ? styles.searchListContentContainerStyles(!!hasFilterBars) : undefined}
                />
            </View>
        );
    }

    const {shouldShowYearCreated, shouldShowYearSubmitted, shouldShowYearApproved, shouldShowYearPosted, shouldShowYearExported, shouldShowYearWithdrawn} = yearIndicators;
    const {shouldShowAmountInWideColumn, shouldShowTaxAmountInWideColumn} = amountIndicators;
    const shouldShowTableHeader = isLargeScreenWidth && !isChat;
    const tableHeaderVisible = canSelectMultiple || shouldShowTableHeader;

    const shouldShowChartView = (view === CONST.SEARCH.VIEW.BAR || view === CONST.SEARCH.VIEW.LINE || view === CONST.SEARCH.VIEW.PIE) && !!validGroupBy;

    if (shouldShowChartView && isGroupedItemArray(sortedData)) {
        if (getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH) {
            cancelSubmitFollowUpActionSpan();
        }
        let chartTitle = translate(`search.chartTitles.${validGroupBy}`);
        if (savedSearch) {
            if (savedSearch.name !== savedSearch.query) {
                chartTitle = savedSearch.name;
            }
        } else if (currentSearchKey && suggestedSearches[currentSearchKey]) {
            const suggestedSearch = suggestedSearches[currentSearchKey];
            const sortMatches = doesSearchItemMatchSort(currentSearchKey, suggestedSearch.searchQueryJSON?.sortBy, suggestedSearch.searchQueryJSON?.sortOrder, sortBy, sortOrder);
            if (sortMatches) {
                chartTitle = translate(suggestedSearch.translationPath);
            }
        }

        return (
            <SearchScopeProvider>
                <Animated.ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.flexGrow1}
                    onScroll={onSearchListScroll}
                    onLayout={onLayoutChart}
                    scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
                >
                    <View style={[shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!hasFilterBars) : styles.mt3, styles.mh4, styles.mb4, styles.flex1]}>
                        <SearchChartWrapper
                            title={chartTitle}
                            groupBy={validGroupBy}
                        >
                            <SearchChartView
                                queryJSON={queryJSON}
                                view={view}
                                groupBy={validGroupBy}
                                data={sortedData}
                                isLoading={shouldShowLoadingState}
                            />
                        </SearchChartWrapper>
                    </View>
                </Animated.ScrollView>
            </SearchScopeProvider>
        );
    }

    return (
        <SearchScopeProvider>
            <Animated.View style={[styles.flex1, animatedStyle]}>
                <SearchList
                    ref={searchListRef}
                    data={stableSortedData}
                    ListItem={ListItem}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={toggleTransaction}
                    onAllCheckboxPress={toggleAllTransactions}
                    canSelectMultiple={canSelectMultiple}
                    selectedTransactions={selectedTransactions}
                    shouldPreventLongPressRow={isChat || isTask}
                    SearchTableHeader={
                        !shouldShowTableHeader ? undefined : (
                            <View style={[!isTask && styles.pr9, styles.flex1]}>
                                <SearchTableHeader
                                    canSelectMultiple={canSelectMultiple}
                                    columns={columnsToShow}
                                    type={type}
                                    onSortPress={onSortPress}
                                    sortOrder={sortOrder}
                                    sortBy={sortBy}
                                    shouldShowYear={shouldShowYearCreated}
                                    shouldShowYearSubmitted={shouldShowYearSubmitted}
                                    shouldShowYearApproved={shouldShowYearApproved}
                                    shouldShowYearPosted={shouldShowYearPosted}
                                    shouldShowYearExported={shouldShowYearExported}
                                    shouldShowYearWithdrawn={shouldShowYearWithdrawn}
                                    isAmountColumnWide={shouldShowAmountInWideColumn}
                                    isTaxAmountColumnWide={shouldShowTaxAmountInWideColumn}
                                    shouldShowSorting
                                    groupBy={validGroupBy}
                                    isExpenseReportView={isExpenseReportType}
                                    isActionColumnWide={isTask || hasDeletedTransaction}
                                />
                            </View>
                        )
                    }
                    contentContainerStyle={[styles.pb3, contentContainerStyle]}
                    containerStyle={[styles.pv0, !tableHeaderVisible && !isSmallScreenWidth && styles.pt1]}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    onScroll={onSearchListScroll}
                    onEndReachedThreshold={0.75}
                    onEndReached={fetchMoreResults}
                    // Single-row skeleton while the deferred write's optimistic data hasn't
                    // appeared in sortedData yet; 5-row skeleton for paginated loading.
                    ListFooterComponent={
                        shouldShowLoadingMoreItems || showPendingExpensePlaceholder ? (
                            <SearchRowSkeleton
                                shouldAnimate
                                fixedNumItems={shouldShowLoadingMoreItems ? 5 : 1}
                                reasonAttributes={showPendingExpensePlaceholder ? pendingExpenseReasonAttributes : loadMoreSkeletonReasonAttributes}
                                isLoadMore
                            />
                        ) : undefined
                    }
                    queryJSON={queryJSON}
                    columns={columnsToShow}
                    violations={violations}
                    onLayout={onLayout}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    shouldAnimate={type === CONST.SEARCH.DATA_TYPES.EXPENSE}
                    newTransactions={newTransactions}
                    hasLoadedAllTransactions={hasLoadedAllTransactions}
                    policyForMovingExpenses={policyForMovingExpenses}
                    nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                    isActionColumnWide={isTask || hasDeletedTransaction}
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
