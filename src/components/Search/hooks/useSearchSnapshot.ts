import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchListItem, TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchData, SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';

import {getSections, getSortedSections, getSortedTransactionData, getValidGroupBy, isSearchDataLoaded, isTransactionEntry, isTransactionGroupListItemType} from '@libs/SearchUIUtils';
import {shouldShowAttendees} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

import useLiveFilteredReportActions from './useLiveFilteredReportActions';
import useOptimisticSearchTracking from './useOptimisticSearchTracking';
import useSearchColumnsToShow from './useSearchColumnsToShow';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

type OptimisticTrackingReturn = ReturnType<typeof useOptimisticSearchTracking>;
type OptimisticTrackingParams = Parameters<typeof useOptimisticSearchTracking>[0];

/**
 * Return shape of the Search data layer hook.
 *
 * `data` holds the fully sorted and joined row items that `SearchList` reads its display fields off.
 * The hook owns the whole projection (sort, group, paginate, and the optimistic-row resilience) so the
 * screen computes it exactly once.
 */
type SearchSnapshotResult = {
    /** Sorted and optimistic-stabilized row items for the current query. */
    data: SearchListItem[];
    /** Sorted row items BEFORE optimistic stabilization. The chart view consumes this, not `data`. */
    chartData: SearchListItem[];
    /** Group-enriched sections before sort, capped to `visibleRowLimit`. Consumed for selection counts and bulk-action wiring. */
    filteredData: SearchData;
    /** Length of the base (pre-sort) sections (used as `prevReportsLength` when firing the next search). */
    filteredDataLength: number;
    /** Total result count reported by `getSections` (drives the pagination guard). */
    allDataLength: number;
    /** Whether any visible transaction is deleted (widens the action column). */
    hasDeletedTransaction: boolean;
    /** Columns to render, derived from the snapshot. */
    columns: SearchColumnType[];
    /** Whether the snapshot is still loading from the server. */
    isLoading: boolean;
    /** Whether the server reports more results beyond the current page. */
    hasMore: boolean;
    /** Whether every transaction (including grouped sub-snapshots) has been loaded. */
    hasLoadedAllTransactions: boolean;
    /** True while the cached optimistic row is being re-injected across a snapshot-replacement gap. */
    hasCachedOptimisticItem: boolean;
    /** Every policy's categories, already read here for sorting and reused to size the category GL code column. */
    policyCategories: OnyxCollection<PolicyCategories>;
    /** Every policy's tag lists, already read here for sorting and reused to size the tag GL code column. */
    policyTags: OnyxCollection<PolicyTagLists>;
} & Pick<
    OptimisticTrackingReturn,
    'showPendingExpensePlaceholder' | 'shouldDeferHeavySearchWork' | 'setShouldDeferHeavySearchWork' | 'hasPendingWriteOnMountRef' | 'skipDeferralOnFocusRef' | 'rearmTracking'
>;

type UseSearchSnapshotParams = {
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot, owned by the ancestor and passed in. */
    searchResults: SearchResults | undefined;
    /** Full TRANSACTION + REPORT_ACTIONS collections used by the optimistic-row tracking. Threaded in from
     *  the parent (which already subscribes to them for the refetch hook) so we don't open duplicate
     *  full-collection reads. */
    transactions: OptimisticTrackingParams['transactions'];
    reportActions: OptimisticTrackingParams['reportActions'];
    /** Row cap for `data`. Live (to-do) searches page on this instead of a server cursor; their rows are all report groups. */
    visibleRowLimit?: number;

    /** Rows ticked here stay rendered past `visibleRowLimit`. */
    selectedTransactions?: SelectedTransactions;
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_HASHES: string[] = [];
const EMPTY_GROUP_ITEMS: TransactionGroupListItemType[] = [];

type SearchSectionData = {
    baseFilteredData: SearchListItem[];
    filteredDataLength: number;
    allDataLength: number;
    hasDeletedTransaction: boolean;
};

function useSearchSections(options: Parameters<typeof getSections>[0] | undefined): SearchSectionData {
    // This projection has no other hooks, so opt it into compilation explicitly.
    'use memo';

    if (!options) {
        return {baseFilteredData: EMPTY_DATA, filteredDataLength: 0, allDataLength: 0, hasDeletedTransaction: false};
    }

    const [filtered, allDataLength, hasDeletedTransaction] = getSections(options);
    return {baseFilteredData: filtered as SearchListItem[], filteredDataLength: filtered.length, allDataLength, hasDeletedTransaction};
}

function useSortedSearchSections(shouldComputeSections: boolean, hash: number, sortArgs: Parameters<typeof getSortedSections>): SearchListItem[] {
    // The hook boundary keeps projection results immutable for the downstream optimistic-state hook.
    'use memo';

    if (!shouldComputeSections) {
        return EMPTY_DATA;
    }

    return getSortedSections(...sortArgs).map((item) => (item.hash === hash ? item : {...item, hash}));
}

/** How many leading rows the cap keeps: `rowLimit` rows on screen, stretched down to the last ticked row. */
function getRowLimitEnd(rows: SearchListItem[], rowLimit: number, selectedTransactions: SelectedTransactions | undefined, isOffline: boolean): number {
    const isKeySelected = (key: string | undefined) => !!key && !!selectedTransactions?.[key]?.isSelected;
    let shownRowCount = 0;
    let end = 0;
    for (const [index, row] of rows.entries()) {
        // online, a row being deleted is hidden, so it doesn't use up the cap
        if (!isOffline && row.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        shownRowCount += 1;
        const isRowSelected = isKeySelected(row.keyForList) || (isTransactionGroupListItemType(row) && row.transactions.some((transaction) => isKeySelected(transaction.keyForList)));
        if (shownRowCount <= rowLimit || isRowSelected) {
            end = index + 1;
        }
    }
    return end;
}

const hashToString = (queryHash?: number) => (queryHash || queryHash === 0 ? String(queryHash) : undefined);

/**
 * Single data layer for the Search screen.
 *
 * Owns the live inputs `getSections` needs for sort/group correctness, runs the deferral-gated
 * sort/group/paginate projection, enriches grouped views with their per-group sub-snapshots, and absorbs
 * the optimistic-row resilience. Returns the sorted rows plus the list-level meta and the
 * optimistic-tracking carriers that `<Search>` consumes.
 */
function useSearchSnapshot({queryJSON, searchResults, transactions, reportActions, visibleRowLimit, selectedTransactions}: UseSearchSnapshotParams): SearchSnapshotResult {
    const {type, sortBy, sortOrder, hash, groupBy} = queryJSON;

    const {isOffline} = useNetwork();
    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {convertToDisplayString} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();
    const {shouldUseLiveData} = useSearchResultsContext();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const reportAttributesDerivedValue = useReportAttributes();
    const {policyForMovingExpensesID, policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isAttendeesEnabledForMovingPolicy = shouldShowAttendees(CONST.IOU.TYPE.SUBMIT, policyForMovingExpenses);

    const exportReportActions = useLiveFilteredReportActions();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [onyxPersonalDetailsList] = useAllPersonalDetails();
    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    // Inject an optimistically-created transaction the server has not indexed yet so its row mounts
    // immediately.
    const {
        showPendingExpensePlaceholder,
        shouldDeferHeavySearchWork,
        setShouldDeferHeavySearchWork,
        searchDataWithOptimisticTransaction,
        hasPendingWriteOnMountRef,
        skipDeferralOnFocusRef,
        rearmTracking,
        trackingState,
    } = useOptimisticSearchTracking({
        searchResults,
        queryJSON,
        transactions,
        reportActions,
    });
    const optimisticTransactionID = trackingState.optimisticWatchKey?.toString().replace(ONYXKEYS.COLLECTION.TRANSACTION, '');

    const validGroupBy = getValidGroupBy(groupBy);
    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
    const isExpenseReportType = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    // Only CHAT/TASK sections read reportAttributesDerivedValue. It's a derived value that gets a new
    // reference whenever any report changes (e.g. on every step of a PAY), so keeping it in the deps for
    // other types forces needless full getSections recomputes. Gate it to undefined elsewhere so the dep
    // stays stable.
    const reportAttributesForSections = isChat || isTask ? reportAttributesDerivedValue : undefined;
    // Same for report name-value pairs: only task sections read them (parent archived state), and OpenReport writes them for the opened report.
    const reportNameValuePairsForSections = isTask ? reportNameValuePairs : undefined;

    const isLoading = !!searchResults?.search?.isLoading;
    const hasMore = !!searchResults?.search?.hasMoreResults;

    // There's a race condition in Onyx which makes it return data from the previous Search, so in
    // addition to checking that the data is loaded we also check that the snapshot matches the query.
    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);

    // Mirror the legacy `<Search>` gate: skip the heavy projection while deferring, before data is
    // loaded, or for the invalid group-by-on-chat/task combo. Drives every stage below.
    const shouldComputeSections =
        !shouldDeferHeavySearchWork && searchResults !== undefined && isDataLoaded && !!searchDataWithOptimisticTransaction && !(validGroupBy && (isChat || isTask));

    // Stage 1: base sections from the (optimistically augmented) snapshot.
    const {baseFilteredData, filteredDataLength, allDataLength, hasDeletedTransaction} = useSearchSections(
        shouldComputeSections
            ? {
                  dateFnsLocale,
                  type,
                  data: searchDataWithOptimisticTransaction,
                  currentAccountID: accountID,
                  currentUserEmail: email ?? '',
                  translate,
                  formatPhoneNumber,
                  bankAccountList,
                  rules,
                  groupBy: validGroupBy,
                  reportActions: exportReportActions,
                  currentSearch: currentSearchKey,
                  reportNameValuePairs: reportNameValuePairsForSections,
                  queryJSON,
                  isActionLoadingSet,
                  cardFeeds,
                  cardList: personalAndWorkspaceCards,
                  nonPersonalAndWorkspaceCardList: nonPersonalAndWorkspaceCards,
                  isOffline,
                  customCardNames,
                  conciergeReportID,
                  onyxPersonalDetailsList,
                  isAttendeesEnabledForMovingPolicy,
                  convertToDisplayString,
                  reportAttributesDerivedValue: reportAttributesForSections,
                  optimisticTransactionID,
              }
            : undefined,
    );

    // Stage 2: for grouped views, fetch each group's sub-snapshot and enrich it with its transactions.
    // validGroupBy guarantees these are group containers (chat/task are guarded out above).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by validGroupBy
    const groupItems = validGroupBy ? (baseFilteredData as TransactionGroupListItemType[]) : EMPTY_GROUP_ITEMS;
    const groupByTransactionHashes = validGroupBy
        ? groupItems.map((item) => hashToString(item.transactionsQueryJSON?.hash)).filter((hashValue): hashValue is string => !!hashValue)
        : EMPTY_HASHES;
    const groupByTransactionSnapshots = useMultipleSnapshots(groupByTransactionHashes);

    const filteredData: SearchData =
        !validGroupBy || isExpenseReportType
            ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- snapshot rows are a SearchData subset
              (baseFilteredData as SearchData)
            : groupItems.map((item) => {
                  const subSnapshot = groupByTransactionSnapshots[hashToString(item.transactionsQueryJSON?.hash) ?? ''];
                  if (!subSnapshot?.data) {
                      return item;
                  }
                  const [groupTransactions] = getSections({
                      dateFnsLocale,
                      type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                      data: subSnapshot.data,
                      currentAccountID: accountID,
                      currentUserEmail: email ?? '',
                      bankAccountList,
                      rules,
                      translate,
                      formatPhoneNumber,
                      isActionLoadingSet,
                      cardFeeds,
                      cardList: personalAndWorkspaceCards,
                      conciergeReportID,
                      onyxPersonalDetailsList,
                      convertToDisplayString,
                      reportActions: exportReportActions,
                      reportAttributesDerivedValue: undefined,
                  });
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group children are flat transactions
                  const typedGroupTransactions = groupTransactions as TransactionListItemType[];
                  const shownTransactionIDs = new Set(typedGroupTransactions.map((transaction) => transaction.transactionID));
                  const hiddenTransactionIDs = Object.keys(subSnapshot.data)
                      .filter(isTransactionEntry)
                      .map((key) => subSnapshot.data[key]?.transactionID)
                      .filter((transactionID): transactionID is string => !!transactionID && !shownTransactionIDs.has(transactionID));
                  return {
                      ...item,
                      transactions: getSortedTransactionData(typedGroupTransactions, localeCompare, translate, CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.DESC),
                      hiddenTransactionIDs,
                      hasMoreTransactions: subSnapshot.search?.hasMoreResults,
                  };
              });

    // Stage 3: sort the (enriched) data. getSortedSections accepts the full section union; our
    // SearchListItem[] is a compatible subset of that input.
    const sortInput = filteredData as Parameters<typeof getSortedSections>[1];
    const chartData = useSortedSearchSections(shouldComputeSections, hash, [
        type,
        sortInput,
        localeCompare,
        translate,
        sortBy,
        sortOrder,
        validGroupBy,
        {
            policyCategories,
            policyTags,
            fallbackPolicyID: policyForMovingExpensesID,
        },
    ]);

    // Keep the optimistic row visible across a snapshot-replacement gap for up to
    // OPTIMISTIC_ROLLBACK_GRACE_MS until the new snapshot picks it up or the grace expires.
    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    // Not memoized: unlike the data chain above, `columns` is not part of the render loop, and its
    // reference is already stabilized downstream by `columnsToShow` in <Search> (which preserves the
    // previous array when contents are equal). The compiler leaves this fresh per render, which is fine.
    const columns = useSearchColumnsToShow(queryJSON, searchResults);

    // Non-grouped views are always fully loaded; grouped views require every group's sub-snapshot to
    // report no further results.
    let hasLoadedAllTransactions;
    if (!validGroupBy) {
        hasLoadedAllTransactions = true;
    } else {
        hasLoadedAllTransactions = groupItems.every((item) => {
            const subSnapshot = item.transactionsQueryJSON?.hash || item.transactionsQueryJSON?.hash === 0 ? groupByTransactionSnapshots[String(item.transactionsQueryJSON.hash)] : undefined;
            return item.transactions.length === 0 || !subSnapshot || !subSnapshot?.search?.hasMoreResults;
        });
    }

    // slice after the sort so page 2 continues the order on screen
    const rowLimitEnd = visibleRowLimit === undefined ? stableSortedData.length : getRowLimitEnd(stableSortedData, visibleRowLimit, selectedTransactions, isOffline);
    const isRowLimitApplied = rowLimitEnd < stableSortedData.length;
    const visibleData = isRowLimitApplied ? stableSortedData.slice(0, rowLimitEnd) : stableSortedData;
    // selection runs off this, so cap it too or "select all" reaches rows that were never rendered; live rows are all report groups
    const visibleFilteredData = isRowLimitApplied ? visibleData.filter(isTransactionGroupListItemType) : filteredData;

    return {
        data: visibleData,
        chartData,
        filteredData: visibleFilteredData,
        filteredDataLength,
        allDataLength,
        hasDeletedTransaction,
        columns,
        isLoading,
        hasMore,
        hasLoadedAllTransactions,
        hasCachedOptimisticItem,
        showPendingExpensePlaceholder,
        shouldDeferHeavySearchWork,
        setShouldDeferHeavySearchWork,
        hasPendingWriteOnMountRef,
        skipDeferralOnFocusRef,
        rearmTracking,
        policyCategories,
        policyTags,
    };
}

export default useSearchSnapshot;
