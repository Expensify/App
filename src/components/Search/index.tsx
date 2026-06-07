import {findFocusedRoute, useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {deepEqual} from 'fast-equals';
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
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import type {ActionHandledType} from '@hooks/useHoldMenuSubmit';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSaveSortedReportIDs from '@hooks/useSaveSortedReportIDs';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useStableArrayReference from '@hooks/useStableArrayReference';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode, turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {saveLastSearchParams} from '@libs/actions/ReportNavigation';
import type {TransactionPreviewData} from '@libs/actions/Search';
import {setOptimisticDataForTransactionThreadPreview} from '@libs/actions/Search';
import {flushDeferredWrite, hasDeferredWrite} from '@libs/deferredLayoutWrite';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import openInternalRouteInNewTab, {isModifiedMousePress} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
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
    isTransactionSearchType,
    shouldShowEmptyState,
    shouldShowYear as shouldShowYearUtil,
} from '@libs/SearchUIUtils';
import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {cancelSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {getOriginalTransactionWithSplitInfo, hasValidModifiedAmount, isOnHold, isTransactionPendingDelete, shouldShowAttendees} from '@libs/TransactionUtils';
import Navigation, {navigationRef} from '@navigation/Navigation';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector} from '@src/selectors/Onboarding';
import type {OutstandingReportsByPolicyIDDerivedValue, Report, ReportAction, SaveSearch, Transaction} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOptimisticSearchTracking from './hooks/useOptimisticSearchTracking';
import useStableOptimisticSortedData from './hooks/useStableOptimisticSortedData';
import SearchChartView from './SearchChartView';
import SearchChartWrapper from './SearchChartWrapper';
import {useSearchQueryActions, useSearchQueryContext, useSearchResultsActions, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {useSyncSelectedReports} from './SearchContextProvider';
import SearchList from './SearchList';
import type {ReportActionListItemType, SearchListItem, TransactionGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from './SearchList/ListItem/types';
import {SearchScopeProvider} from './SearchScopeProvider';
import SearchTableHeader from './SearchTableHeader';
import type {SearchColumnType, SearchParams, SearchQueryJSON, SearchSortBy, SelectedTransactionInfo, SelectedTransactions, SortOrder} from './types';

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

type HoldMenuCallback = (item: TransactionReportGroupListItemType, requestType: ActionHandledType, paymentType?: PaymentMethodType) => void;

const hashToString = (queryHash?: number) => (queryHash || queryHash === 0 ? String(queryHash) : undefined);

function mapTransactionItemToSelectedEntry(
    item: TransactionListItemType,
    itemTransaction: OnyxEntry<Transaction>,
    originalItemTransaction: OnyxEntry<Transaction>,
    currentUserLogin: string,
    currentUserAccountID: number,
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined,
    allowNegativeAmount: boolean,
    parentReport: OnyxEntry<Report> | undefined,
    selfDMReport: OnyxEntry<Report> | undefined,
    isProduction: boolean,
): [string, SelectedTransactionInfo] {
    const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(item.report, item.reportAction, item.holdReportAction, item, item.policy, currentUserAccountID);
    const canRejectRequest = item.report ? canRejectReportAction(currentUserLogin, item.report) : false;
    const amount = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : item.amount;
    const isUnreported = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const reportForSplit = item.report ?? (isUnreported ? selfDMReport : undefined);

    return [
        item.keyForList,
        {
            transaction: item,
            isSelected: true,
            canReject: canRejectRequest,
            canHold: canHoldRequest,
            isHeld: isOnHold(item),
            canUnhold: canUnholdRequest,
            canSplit: isSplitAction(reportForSplit, [itemTransaction], originalItemTransaction, currentUserLogin, currentUserAccountID, item.policy, parentReport, isProduction),
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

function mapEmptyReportToSelectedEntry(item: TransactionReportGroupListItemType | TransactionGroupListItemType): [string, SelectedTransactionInfo] {
    if (isTransactionReportGroupListItemType(item)) {
        const currency = item.currency ?? '';
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
                amount: item.totalDisplaySpend ?? item.total ?? 0,
                currency,
                ...(currency ? {groupCurrency: currency} : {}),
            },
        ];
    }

    const currency = item.currency ?? '';

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
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: item.reportID,
            policyID: item.policyID ?? CONST.POLICY.ID_FAKE,
            amount: item.total ?? 0,
            currency,
            ...(currency ? {groupCurrency: currency} : {}),
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
    outstandingReportsByPolicyID: OutstandingReportsByPolicyIDDerivedValue | undefined,
    parentReport: OnyxEntry<Report> | undefined,
    selfDMReport: OnyxEntry<Report> | undefined,
    isProduction: boolean,
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
        parentReport,
        selfDMReport,
        isProduction,
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

    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const prevIsOffline = usePrevious(isOffline);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isLargeScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const styles = useThemeStyles();
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const isFocused = useIsFocused();

    const {markReportIDAsExpense, markReportIDAsMultiTransactionExpense, unmarkReportIDAsMultiTransactionExpense} = useWideRHPActions();
    const {currentSearchHash, currentSearchKey, shouldResetSearchQuery, suggestedSearches} = useSearchQueryContext();
    const {lastSearchType, shouldUseLiveData} = useSearchResultsContext();
    const {selectedTransactions, shouldTurnOffSelectionMode, areAllMatchingItemsSelected} = useSearchSelectionContext();

    const {setShouldResetSearchQuery} = useSearchQueryActions();
    const {setShouldShowFiltersBarLoading} = useSearchResultsActions();
    const {setSelectedTransactions, clearSelectedTransactions, selectAllMatchingItems} = useSearchSelectionActions();
    const [offset, setOffset] = useState(0);

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const previousTransactions = usePrevious(transactions);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const selfDMReport = useSelfDMReport();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const {
        showPendingExpensePlaceholder,
        shouldDeferHeavySearchWork,
        setShouldDeferHeavySearchWork,
        searchDataWithOptimisticTransaction,
        hasPendingWriteOnMountRef,
        skipDeferralOnFocusRef,
        rearmTracking,
        trackingState: optimisticTrackingState,
    } = useOptimisticSearchTracking({searchResults, queryJSON, transactions, reportActions});

    const isExpenseReportType = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const archivedReportsIdSet = useArchivedReportsIdSet();

    const [exportReportActions] = useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction[]> | undefined>(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: selectFilteredReportActions,
    });

    const {policyForMovingExpensesID, policyForMovingExpenses} = usePolicyForMovingExpenses();
    // Only the boolean derived from policyForMovingExpenses is consumed by row components downstream.
    // Drilling the policy object causes ref churn on every unrelated policy update (Pusher pushes).
    const isAttendeesEnabledForMovingPolicy = shouldShowAttendees(CONST.IOU.TYPE.SUBMIT, policyForMovingExpenses);

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

    const {convertToDisplayString} = useCurrencyListActions();

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

    const {newSearchResultKeys, handleSelectionListScroll, newTransactions, hasQueuedHighlights} = useSearchHighlightAndScroll({
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

    // Mirror `hasQueuedHighlights` into a ref so the post-create-flow `useFocusEffect`
    // (which has empty deps) can read the latest value without re-creating its callback.
    // Used to skip the deferral that would otherwise hide the freshly-added row from
    // FlashList during the RHP dismiss transition, which would prevent the highlight
    // animation from ever firing on it.
    const hasQueuedHighlightsRef = useRef(hasQueuedHighlights);
    useEffect(() => {
        hasQueuedHighlightsRef.current = hasQueuedHighlights;
    }, [hasQueuedHighlights]);

    // There's a race condition in Onyx which makes it return data from the previous Search, so in addition to checking that the data is loaded
    // we also need to check that the searchResults matches the type and status of the current search
    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    const deferHeavySearchWork = useCallback(
        (useDoubleFrame = false) => {
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- useState setters are referentially stable
        [],
    );

    // Only defer heavy work (getSections) when data isn't available yet.
    // Skipping the defer for live data (to-dos) and cached results avoids a
    // flash of the empty state or a blank page caused by a redundant defer cycle.
    useEffect(() => {
        if (isDataLoaded) {
            setShouldDeferHeavySearchWork(false);
            return;
        }
        return deferHeavySearchWork();
    }, [hash, deferHeavySearchWork, isDataLoaded, setShouldDeferHeavySearchWork]);

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

            // If the highlight hook already queued rows for the post-create animation,
            // skip the skeleton-during-transition defer. Otherwise FlashList stays empty
            // for ~1s while the RHP dismiss transition runs, the row never mounts inside
            // the 300ms highlight window, and `useAnimatedHighlightStyle` never fires.
            if (hasQueuedHighlightsRef.current) {
                return;
            }

            // Show skeleton while the RHP dismiss animation plays. The transition
            // hasn't started yet when useFocusEffect fires (it begins after paint),
            // so waitForUpcomingTransition defers until the animation actually ends.
            setShouldDeferHeavySearchWork(true);
            const handle = TransitionTracker.runAfterTransitions({
                callback: () => setShouldDeferHeavySearchWork(false),
                waitForUpcomingTransition: true,
            });
            return () => handle.cancel();
            // eslint-disable-next-line react-hooks/exhaustive-deps -- useState setters and refs are referentially stable
        }, []),
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
    const shouldShowRowSkeleton = (!skeletonWasDisplayed || shouldShowLoadingState) && showPendingExpensePlaceholder && !hasErrors;

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
        if (shouldDeferHeavySearchWork || searchResults === undefined || !isDataLoaded || !searchDataWithOptimisticTransaction) {
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
            data: searchDataWithOptimisticTransaction,
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
            cardList: nonPersonalAndWorkspaceCards,
            isOffline,
            allTransactionViolations: violations,
            customCardNames,
            conciergeReportID,
            onyxPersonalDetailsList,
            policyForMovingExpenses,
            convertToDisplayString,
            optimisticTransactionID: optimisticTrackingState.optimisticWatchKey?.toString().replace(ONYXKEYS.COLLECTION.TRANSACTION, ''),
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
        searchDataWithOptimisticTransaction,
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
        nonPersonalAndWorkspaceCards,
        policies,
        bankAccountList,
        violations,
        customCardNames,
        conciergeReportID,
        onyxPersonalDetailsList,
        policyForMovingExpenses,
        convertToDisplayString,
        optimisticTrackingState.optimisticWatchKey,
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
                conciergeReportID,
                convertToDisplayString,
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
        conciergeReportID,
        convertToDisplayString,
    ]);

    const hasLoadedAllTransactions = useMemo(() => {
        if (!validGroupBy) {
            return true;
        }
        // For group-by views, check if all transactions in groups have been loaded
        return (baseFilteredData as TransactionGroupListItemType[]).every((item) => {
            const snapshot = item.transactionsQueryJSON?.hash || item.transactionsQueryJSON?.hash === 0 ? groupByTransactionSnapshots[String(item.transactionsQueryJSON.hash)] : undefined;
            // If snapshot exists and has hasMoreResults: true, not all transactions are loaded
            return item.transactions.length === 0 || !snapshot || !snapshot?.search?.hasMoreResults;
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
        if (hasPendingWriteOnMountRef.current.hasPendingWriteOnMount && hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
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

                if (transactionGroup.transactions.length === 0) {
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
                const wasReportSelected = !!(reportKey && reportKey in selectedTransactions);
                const hasIndividualSelectedInGroup = transactionGroup.transactions.some(
                    (transaction) => (!!transaction.keyForList && transaction.keyForList in selectedTransactions) || transaction.transactionID in selectedTransactions,
                );
                const propagateSelectionToAllRows = (isExpenseReportType && (wasReportSelected || hasIndividualSelectedInGroup)) || (wasReportSelected && !isExpenseReportType);

                for (const transactionItem of transactionGroup.transactions) {
                    const listKey = transactionItem.keyForList ?? transactionItem.transactionID;
                    const isSelected = listKey in selectedTransactions || transactionItem.transactionID in selectedTransactions;

                    // Include transaction if: already individually selected, part of select-all, or group-level propagation (expense report / empty group expanded)
                    const shouldInclude = isSelected || areAllMatchingItemsSelected || propagateSelectionToAllRows;
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
                    const itemParentReport = searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                    const isItemUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                    const reportForSplit = transactionItem.report ?? (isItemUnreported ? selfDMReport : undefined);

                    const previousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                    newTransactionList[listKey] = {
                        transaction: transactionItem,
                        action: transactionItem.action,
                        canHold: canHoldRequest,
                        isHeld: isOnHold(transactionItem),
                        canUnhold: canUnholdRequest,
                        canSplit: isSplitAction(reportForSplit, [itemTransaction], originalItemTransaction, login ?? '', accountID, transactionItem.policy, itemParentReport, isProduction),
                        hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                        canChangeReport: canEditFieldOfMoneyRequest({
                            reportAction: transactionItem.reportAction,
                            fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                            outstandingReportsByPolicyID,
                            transaction: transactionItem,
                            report: transactionItem.report,
                            policy: transactionItem.policy,
                        }),

                        isSelected: areAllMatchingItemsSelected || !!previousSelection?.isSelected || propagateSelectionToAllRows,
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
                        groupKey: previousSelection?.groupKey ?? (propagateSelectionToAllRows && !isExpenseReportType ? reportKey : undefined),
                    };
                }
            }
        } else {
            for (const transactionItem of filteredData) {
                if (!Object.hasOwn(transactionItem, 'transactionID') || !('transactionID' in transactionItem)) {
                    continue;
                }
                const listKey = transactionItem.keyForList ?? transactionItem.transactionID;
                if (!(listKey in selectedTransactions) && !(transactionItem.transactionID in selectedTransactions) && !areAllMatchingItemsSelected) {
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
                const itemParentReport = searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                const isItemUnreported = transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                const reportForSplit = transactionItem.report ?? (isItemUnreported ? selfDMReport : undefined);

                const flatPreviousSelection = selectedTransactions[listKey] ?? selectedTransactions[transactionItem.transactionID];

                newTransactionList[listKey] = {
                    transaction: transactionItem,
                    action: transactionItem.action,
                    canHold: canHoldRequest,
                    isHeld: isOnHold(transactionItem),
                    canUnhold: canUnholdRequest,
                    canSplit: isSplitAction(reportForSplit, [itemTransaction], originalItemTransaction, login ?? '', accountID, transactionItem.policy, itemParentReport, isProduction),
                    hasBeenSplit: getOriginalTransactionWithSplitInfo(itemTransaction, originalItemTransaction).isExpenseSplit,
                    canChangeReport: canEditFieldOfMoneyRequest({
                        reportAction: transactionItem.reportAction,
                        fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                        outstandingReportsByPolicyID,
                        transaction: transactionItem,
                        report: transactionItem.report,
                        policy: transactionItem.policy,
                    }),

                    isSelected: areAllMatchingItemsSelected || !!flatPreviousSelection?.isSelected,
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

        // Bail out when the rebuilt selection is deeply equal to the current one. Without this,
        // a dep that re-derives to a new reference but the same value re-runs this effect, which
        // calls setSelectedTransactions with an equivalent payload and loops until React aborts
        // with "Maximum update depth exceeded". See https://github.com/Expensify/App/issues/89588
        if (deepEqual(newTransactionList, selectedTransactions)) {
            return;
        }

        // Pass `filteredData` so `selectedReports` is updated atomically with `selectedTransactions`.
        // Otherwise a stale `useSyncSelectedReports` derivation in the same commit can briefly clear
        // `selectedReports` while an Onyx push expands the selection, which can close screens like
        // SearchChangeApproverPage that auto-dismiss when `selectedReports` is empty.
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

    useSyncSelectedReports(filteredData);

    const areItemsGrouped = !!validGroupBy || isExpenseReportType;
    const totalSelectableItemsCount = useMemo(() => {
        if (!areItemsGrouped) {
            return filteredData.length;
        }

        return (filteredData as TransactionGroupListItemType[]).reduce((count, item) => {
            // For empty groups, count the group itself as a selectable item
            if (item.transactions.length === 0 && item.keyForList) {
                if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return count;
                }

                return count + 1;
            }
            // For groups with transactions, count all transactions except pending delete ones
            const selectableTransactions = item.transactions.filter((transaction) => !isTransactionPendingDelete(transaction));

            return count + selectableTransactions.length;
        }, 0);
    }, [areItemsGrouped, filteredData]);

    const updateSelectAllMatchingItemsState = useCallback(
        (updatedSelectedTransactions: SelectedTransactions) => {
            if (!totalSelectableItemsCount || isRefreshingSelection.current) {
                return;
            }
            const areAllItemsSelected = totalSelectableItemsCount === Object.keys(updatedSelectedTransactions).length;

            if (!areAllItemsSelected) {
                selectAllMatchingItems(false);
            }
        },
        [totalSelectableItemsCount, selectAllMatchingItems],
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
                const itemParentReport = searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${item.report?.parentReportID}`] as OnyxEntry<Report>;
                const updatedTransactions = prepareTransactionsList(
                    item,
                    itemTransaction,
                    originalItemTransaction,
                    selectedTransactions,
                    email ?? '',
                    accountID,
                    outstandingReportsByPolicyID,
                    itemParentReport,
                    selfDMReport,
                    isProduction,
                );

                // Tag individual transactions with their parent group key so export filtering can derive the group when needed.
                if (areItemsGrouped) {
                    const parentGroup = (filteredData as TransactionGroupListItemType[]).find((group) =>
                        group.transactions.some((transaction) => transaction.keyForList === item.keyForList),
                    );
                    if (parentGroup?.keyForList && updatedTransactions[item.keyForList]) {
                        updatedTransactions[item.keyForList] = {...updatedTransactions[item.keyForList], groupKey: parentGroup.keyForList};
                    }
                }

                setSelectedTransactions(updatedTransactions);
                updateSelectAllMatchingItemsState(updatedTransactions);
                return;
            }

            const currentTransactions = itemTransactions ?? item.transactions;

            if (currentTransactions.length === 0 && item.keyForList) {
                const reportKey = item.keyForList;

                if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return;
                }

                if (selectedTransactions[reportKey]?.isSelected) {
                    const reducedSelectedTransactions: SelectedTransactions = {
                        ...selectedTransactions,
                    };
                    delete reducedSelectedTransactions[reportKey];
                    setSelectedTransactions(reducedSelectedTransactions);
                    updateSelectAllMatchingItemsState(reducedSelectedTransactions);
                    return;
                }

                const [, emptyReportSelection] = mapEmptyReportToSelectedEntry(item);
                const updatedTransactions = {
                    ...selectedTransactions,
                    [reportKey]: emptyReportSelection,
                };
                setSelectedTransactions(updatedTransactions);
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

                setSelectedTransactions(reducedSelectedTransactions);
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
                            const itemParentReport = searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                            const [key, entry] = mapTransactionItemToSelectedEntry(
                                transactionItem,
                                itemTransaction,
                                originalItemTransaction,
                                email ?? '',
                                accountID,
                                outstandingReportsByPolicyID,
                                true,
                                itemParentReport,
                                selfDMReport,
                                isProduction,
                            );
                            return [key, {...entry, groupKey: item.keyForList}];
                        }),
                ),
            };
            setSelectedTransactions(updatedTransactions);
            updateSelectAllMatchingItemsState(updatedTransactions);
        },
        [
            selectedTransactions,
            setSelectedTransactions,
            updateSelectAllMatchingItemsState,
            transactions,
            searchResults?.data,
            email,
            accountID,
            outstandingReportsByPolicyID,
            selfDMReport,
            isProduction,
            areItemsGrouped,
            filteredData,
        ],
    );

    const onSelectRowInMobileSelectionMode = (item: SearchListItem) => {
        if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        toggleTransaction(item);
    };

    const onSelectRow = useCallback(
        (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            const isTransactionItem = isTransactionListItemType(item);
            const backTo = Navigation.getActiveRoute();
            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            if (isTransactionItem && !item?.reportAction?.childReportID) {
                // If the report is unreported (self DM), we want to open the track expense thread instead of a report with an ID of 0
                const shouldOpenTransactionThread = !isOneTransactionReport(item.report) || item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
                const shouldOpenTransactionThreadInNewTab = shouldOpenTransactionThread && isModifiedMousePress(event);
                const targetReportID = createAndOpenSearchTransactionThread({
                    item,
                    introSelected,
                    backTo,
                    currentUserLogin: email ?? '',
                    currentUserAccountID: accountID,
                    betas,
                    isSelfTourViewed,
                    hasCompletedGuidedSetupFlow,
                    IOUTransactionID: item?.reportAction?.childReportID,
                    shouldNavigate: shouldOpenTransactionThread && !shouldOpenTransactionThreadInNewTab,
                });
                if (shouldOpenTransactionThreadInNewTab && targetReportID) {
                    openInternalRouteInNewTab(ROUTES.SEARCH_REPORT.getRoute({reportID: targetReportID, backTo}), event);
                }
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
                        createAndOpenSearchTransactionThread({
                            item: firstTransaction,
                            introSelected,
                            backTo,
                            currentUserLogin: email ?? '',
                            currentUserAccountID: accountID,
                            betas,
                            isSelfTourViewed,
                            hasCompletedGuidedSetupFlow,
                            IOUTransactionID: firstTransaction?.reportAction?.childReportID,
                            transactionPreviewData,
                            shouldNavigate: false,
                        });
                    } else {
                        setOptimisticDataForTransactionThreadPreview(firstTransaction, transactionPreviewData, firstTransaction?.reportAction?.childReportID);
                    }
                }

                if (item.transactions.length > 1) {
                    markReportIDAsMultiTransactionExpense(reportID);
                } else {
                    unmarkReportIDAsMultiTransactionExpense(reportID);
                }

                // Persist the current search context so prev/next navigation arrows
                // in the report RHP can reference the correct result set.
                saveLastSearchParams({
                    queryJSON,
                    offset,
                    searchKey: currentSearchKey,
                    hasMoreResults: !!searchResults?.search?.hasMoreResults,
                    allowPostSearchRecount: true,
                });

                const route = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo});
                if (openInternalRouteInNewTab(route, event)) {
                    return;
                }
                requestAnimationFrame(() => Navigation.navigate(route));
                return;
            }

            if (isReportActionListItemType(item)) {
                // Keep deep-linking for persisted actions, but avoid anchoring to optimistic created-task actions that may not be resolvable offline.
                const isOptimisticCreatedTaskAction = reportActionItem.isOptimisticAction ?? false;
                const shouldSkipReportActionID =
                    isCreatedTaskReportAction(reportActionItem) && (isOptimisticCreatedTaskAction || reportActionItem.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                const reportActionID = shouldSkipReportActionID ? undefined : reportActionItem.reportActionID;
                const route = ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo});
                if (openInternalRouteInNewTab(route, event)) {
                    return;
                }
                Navigation.navigate(route);
                return;
            }

            if (isTaskListItemType(item)) {
                const route = ROUTES.SEARCH_REPORT.getRoute({reportID, backTo});
                if (openInternalRouteInNewTab(route, event)) {
                    return;
                }
                requestAnimationFrame(() => Navigation.navigate(route));
                return;
            }

            markReportIDAsExpense(reportID);

            if (isTransactionItem && transactionPreviewData) {
                setOptimisticDataForTransactionThreadPreview(transactionItem, transactionPreviewData, transactionItem?.reportAction?.childReportID);
            }

            const route = ROUTES.SEARCH_REPORT.getRoute({reportID, backTo});
            if (openInternalRouteInNewTab(route, event)) {
                return;
            }
            requestAnimationFrame(() => Navigation.navigate(route));
        },
        [
            markReportIDAsExpense,
            handleSearch,
            markReportIDAsMultiTransactionExpense,
            unmarkReportIDAsMultiTransactionExpense,
            introSelected,
            betas,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            email,
            accountID,
            queryJSON,
            offset,
            searchResults?.search?.hasMoreResults,
            currentSearchKey,
        ],
    );

    const shouldUseStrictDefaultExpenseColumns = currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && isDefaultExpensesQuery(queryJSON);

    const computedColumns = useMemo(() => {
        if (!searchResults?.data) {
            return getEmptyArray<SearchColumnType>();
        }
        return getColumnsToShow({
            currentAccountID: accountID,
            data: searchResults?.data,
            visibleColumns,
            type: searchDataType,
            groupBy: validGroupBy,
            shouldUseStrictDefaultExpenseColumns,
            policyCategories,
            fallbackPolicyID: policyForMovingExpensesID,
        });
    }, [accountID, searchResults?.data, searchDataType, visibleColumns, validGroupBy, shouldUseStrictDefaultExpenseColumns, policyCategories, policyForMovingExpensesID]);

    // getColumnsToShow allocates a fresh array on every call; preserve the previous reference
    // when contents are equal so downstream consumers don't re-render on Onyx snapshot churn
    // (e.g. opening a report bumps searchResults.data) that doesn't actually change the columns.
    const currentColumns = useStableArrayReference(computedColumns);

    const opacity = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
    }));

    const previousColumns = usePrevious(currentColumns);
    const [columnsToShow, setColumnsToShow] = useState<SearchColumnType[]>(getEmptyArray);

    // If columns have changed, trigger an animation before settings columnsToShow to prevent
    // new columns appearing before the fade out animation happens
    useEffect(() => {
        if (previousColumns === currentColumns || offset === 0 || isSmallScreenWidth) {
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

    useSaveSortedReportIDs(type, sortedData);

    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(sortedData, searchResults, optimisticTrackingState);

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
        if (!isFocused || !searchResults?.search?.hasMoreResults || shouldShowLoadingState || shouldShowLoadingMoreItems || offset > allDataLength - CONST.SEARCH.RESULTS_PAGE_SIZE) {
            return;
        }

        setOffset((prev) => prev + CONST.SEARCH.RESULTS_PAGE_SIZE);
    }, [isFocused, searchResults?.search?.hasMoreResults, shouldShowLoadingMoreItems, shouldShowLoadingState, offset, allDataLength]);

    const toggleAllTransactions = useCallback(() => {
        const totalSelected = Object.keys(selectedTransactions).length;

        if (totalSelected > 0) {
            clearSelectedTransactions();
            updateSelectAllMatchingItemsState({});
            return;
        }

        let updatedTransactions: SelectedTransactions;
        if (areItemsGrouped) {
            const allSelections: Array<[string, SelectedTransactionInfo]> = (filteredData as TransactionGroupListItemType[]).flatMap((item) => {
                if (item.transactions.length === 0 && item.keyForList) {
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
                        const itemParentReport = searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                        const [key, entry] = mapTransactionItemToSelectedEntry(
                            transactionItem,
                            itemTransaction,
                            originalItemTransaction,
                            email ?? '',
                            accountID,
                            outstandingReportsByPolicyID,
                            true,
                            itemParentReport,
                            selfDMReport,
                            isProduction,
                        );
                        return [key, {...entry, groupKey: item.keyForList}] as [string, SelectedTransactionInfo];
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
                        const itemParentReport = searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                        return mapTransactionItemToSelectedEntry(
                            transactionItem,
                            itemTransaction,
                            originalItemTransaction,
                            email ?? '',
                            accountID,
                            outstandingReportsByPolicyID,
                            true,
                            itemParentReport,
                            selfDMReport,
                            isProduction,
                        );
                    }),
            );
        }
        setSelectedTransactions(updatedTransactions, filteredData);
        updateSelectAllMatchingItemsState(updatedTransactions);
    }, [
        areItemsGrouped,
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
        selfDMReport,
        isProduction,
    ]);

    const onLayoutBase = useCallback(() => {
        hasHadFirstLayout.current = true;
        onDestinationVisible?.(isSearchResultsEmptyRef.current, 'layout');
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true});
        TransitionTracker.runAfterTransitions({
            callback: () => flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH),
        });
    }, [onDestinationVisible]);

    // Deferred layout only needs the base work (no scroll handling, no content-ready signal).
    const onDeferredLayout = onLayoutBase;

    const onLayout = useCallback(() => {
        onLayoutBase();
        handleSelectionListScroll(stableSortedData, searchListRef.current);
        onContentReady?.();
    }, [onLayoutBase, handleSelectionListScroll, stableSortedData, onContentReady]);

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

    // Tracks whether the pending-expense tracking was re-armed on re-focus
    // (subsequent expense creation while Search stays mounted). Used by the
    // effect below to dismiss the overlay once the deferred write completes,
    // since onLayout won't re-fire for already-mounted content.
    const wasRearmedRef = useRef(false);

    // On re-visits, react-freeze serves the cached layout — onLayout/onLayoutSkeleton never fire.
    // useFocusEffect fires on unfreeze, which is when the screen becomes visible.
    useFocusEffect(
        useCallback(() => {
            if (!hasHadFirstLayout.current) {
                return;
            }

            // Re-arm pending expense skeleton for subsequent creations while Search
            // stays mounted (the original hasPendingWriteOnMountRef only covers the first).
            if (hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH) && !showPendingExpensePlaceholder) {
                wasRearmedRef.current = true;
                rearmTracking();
                setSkeletonWasDisplayed(true);
            }

            onDestinationVisible?.(isSearchResultsEmptyRef.current, 'focus');
            endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {
                [CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: !shouldShowLoadingState,
            });
            // On re-focus (e.g. DISMISS_MODAL_ONLY) onLayout won't re-fire — flush here.
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        }, [shouldShowLoadingState, onDestinationVisible, showPendingExpensePlaceholder, rearmTracking]),
    );

    // Dismiss the overlay after a re-armed deferred write completes. On re-focus,
    // onLayout doesn't re-fire (content already mounted), so onContentReady is
    // never called via the normal path. This effect detects when the deferred
    // write channel is gone (write executed) and sortedData has updated, then
    // signals overlay readiness.
    useEffect(() => {
        if (!wasRearmedRef.current || hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
            return;
        }
        wasRearmedRef.current = false;
        onContentReady?.();
    }, [sortedData, onContentReady]);

    // Empty deps so this fires only on blur — merging with the body would cancel the span on every shouldShowLoadingState flip.
    useFocusEffect(
        useCallback(() => {
            return () => {
                cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS);
            };
        }, []),
    );

    // Reset before conditional returns. Only cancelNavigationSpans (error/empty paths)
    // sets it to true. Must happen during render since it coordinates with the
    // dep-free useEffect above — see comment on didBailToFallbackState.
    didBailToFallbackState.current = false;

    const isAnyVisibleActionLoading = useMemo(
        () => filteredData.some((item) => 'reportID' in item && item.reportID && isActionLoadingSet.has(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${item.reportID}`)),
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
        (column: SearchSortBy, order: SortOrder) => {
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

    // When heavy work is deferred (e.g. during the RHP dismiss animation after
    // submitting an expense), skip the expensive render below. The ancestor
    // SearchPage (via SearchPageNarrow / SearchPageWide) renders a SearchStaticList
    // overlay that covers this component, so the user sees real-looking content.
    // The minimal View fires onLayout to flush the deferred API write and set
    // hasHadFirstLayout.
    if (isDeferringHeavyWork && searchResults?.data && isTransactionSearchType(type)) {
        // Zero-sized View - onLayout still fires on RN, which is all we need here.
        return <View onLayout={onDeferredLayout} />;
    }

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
        !hasCachedOptimisticItem &&
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
                    onSelectRow={isMobileSelectionModeEnabled ? onSelectRowInMobileSelectionMode : onSelectRow}
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
                    containerStyle={[styles.pv0, !tableHeaderVisible && !isSmallScreenWidth && styles.pt3]}
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
                    onLayout={onLayout}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    shouldAnimate={type === CONST.SEARCH.DATA_TYPES.EXPENSE}
                    newTransactions={newTransactions}
                    hasLoadedAllTransactions={hasLoadedAllTransactions}
                    isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                    nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                    isActionColumnWide={isTask || hasDeletedTransaction}
                />
            </Animated.View>
        </SearchScopeProvider>
    );
}

Search.displayName = 'Search';

export type {HoldMenuCallback};
const WrappedSearch = Sentry.withProfiler(Search) as typeof Search;
WrappedSearch.displayName = 'Search';

export default WrappedSearch;
