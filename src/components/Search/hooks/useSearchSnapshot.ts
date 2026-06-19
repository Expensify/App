import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {ReportActionListItemType, SearchListItem, TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchData, SearchQueryJSON} from '@components/Search/types';
import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import useArchivedReportsIDSet from '@hooks/useArchivedReportsIDSet';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';
import {selectFilteredReportActions} from '@libs/ReportUtils';
import {isDefaultExpensesQuery} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getSections, getSortedSections, getValidGroupBy, isSearchDataLoaded} from '@libs/SearchUIUtils';
import {shouldShowAttendees} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {ReportAction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import useOptimisticSearchTracking from './useOptimisticSearchTracking';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

type OptimisticTrackingReturn = ReturnType<typeof useOptimisticSearchTracking>;
type OptimisticTrackingParams = Parameters<typeof useOptimisticSearchTracking>[0];

/**
 * Public contract of the Search data layer (Slice S4, callstack-internal/expensify-issues#2546).
 *
 * S4 is a HYDRATED FACADE, not the PRD's identities-only layer: `data` is the fully sorted+joined row
 * items that `SearchList` and the legacy rows still read pre-joined display fields off. Returning
 * identities-only is deferred to S5/S6 (#2547/#2548), where the rows source their own display from
 * narrow Onyx subscriptions and the shell stops reading joined fields off the item. Until then the
 * hook owns the whole projection (sort/group/paginate + the two-phase optimistic resilience) so the
 * screen does it exactly once.
 *
 * `searchResults`, `newSearchResultKeys`, `transactions`, and `reportActions` are transitional inputs.
 * The snapshot subscription moves inside the hook in S6 (when `<Search>` becomes the router) and the
 * highlight keys move in with the S5 highlight primitive. The full TRANSACTION/REPORT_ACTIONS
 * collections are threaded from the parent (which already subscribes to them for the highlight hook)
 * rather than re-subscribed here, so the screen opens each full-collection subscription only once.
 */
type SearchSnapshotResult = {
    /** Sorted + optimistic-stabilized row items for the current query (hydrated for now). */
    data: SearchListItem[];
    /** Sorted row items BEFORE optimistic stabilization. The chart view consumes this, not `data`. */
    chartData: SearchListItem[];
    /** Group-enriched sections before sort. Consumed for selection counts and bulk-action wiring. */
    filteredData: SearchData;
    /** Length of the stage-1 sections (used as `prevReportsLength` when firing the next search). */
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
} & Pick<
    OptimisticTrackingReturn,
    'showPendingExpensePlaceholder' | 'shouldDeferHeavySearchWork' | 'setShouldDeferHeavySearchWork' | 'hasPendingWriteOnMountRef' | 'skipDeferralOnFocusRef' | 'rearmTracking'
>;

type UseSearchSnapshotParams = {
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot. Passed in from the ancestor until the hook owns the subscription (S6). */
    searchResults: SearchResults | undefined;
    /** Keys flagged for the post-create highlight animation. Passed in until the highlight primitive lands (S5). */
    newSearchResultKeys: Set<string> | null | undefined;
    /** Full TRANSACTION + REPORT_ACTIONS collections for the optimistic Phase 1. Passed in from the parent
     *  (which already subscribes for the highlight hook) so we don't open duplicate full-collection reads. */
    transactions: OptimisticTrackingParams['transactions'];
    reportActions: OptimisticTrackingParams['reportActions'];
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_COLUMNS: SearchColumnType[] = [];
const EMPTY_HASHES: string[] = [];
const EMPTY_GROUP_ITEMS: TransactionGroupListItemType[] = [];

const hashToString = (queryHash?: number) => (queryHash || queryHash === 0 ? String(queryHash) : undefined);

/**
 * Single data layer for the Search screen.
 *
 * Owns the live inputs `getSections` needs for sort/group correctness (S3 judged these load-bearing),
 * runs the deferral-gated sort/group/paginate projection, stamps the post-create highlight, enriches
 * grouped views with their per-group sub-snapshots, and absorbs the two-phase optimistic-row
 * resilience. Returns the hydrated rows plus the list-level meta and the transitional carriers
 * `<Search>` still needs while it owns the view/interaction layer.
 */
function useSearchSnapshot({queryJSON, searchResults, newSearchResultKeys, transactions, reportActions}: UseSearchSnapshotParams): SearchSnapshotResult {
    const {type, status, sortBy, sortOrder, hash, groupBy} = queryJSON;

    const {isOffline} = useNetwork();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {convertToDisplayString} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();
    const {shouldUseLiveData} = useSearchResultsContext();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const archivedReportsIDSet = useArchivedReportsIDSet();
    const reportAttributesDerivedValue = useReportAttributes();
    const {policyForMovingExpensesID, policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isAttendeesEnabledForMovingPolicy = shouldShowAttendees(CONST.IOU.TYPE.SUBMIT, policyForMovingExpenses);

    const [exportReportActions] = useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction[]> | undefined>(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: selectFilteredReportActions,
    });
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [onyxPersonalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});

    // Phase 1 (snapshot augmentation): inject an optimistically-created transaction the server has not
    // indexed yet so its row mounts immediately. Composed here; the standalone hook is deleted in S6.
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

    const isLoading = !!searchResults?.search?.isLoading;
    const hasMore = !!searchResults?.search?.hasMoreResults;

    // There's a race condition in Onyx which makes it return data from the previous Search, so in
    // addition to checking that the data is loaded we also check that the snapshot matches the query.
    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);
    const searchDataType = shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type;

    // Mirror the legacy `<Search>` gate: skip the heavy projection while deferring, before data is
    // loaded, or for the invalid group-by-on-chat/task combo. Drives every stage below.
    const shouldComputeSections =
        !shouldDeferHeavySearchWork && searchResults !== undefined && isDataLoaded && !!searchDataWithOptimisticTransaction && !(validGroupBy && (isChat || isTask));

    // Stage 1: base sections from the (optimistically augmented) snapshot.
    const {baseFilteredData, filteredDataLength, allDataLength, hasDeletedTransaction} = ((): {
        baseFilteredData: SearchListItem[];
        filteredDataLength: number;
        allDataLength: number;
        hasDeletedTransaction: boolean;
    } => {
        if (!shouldComputeSections || !searchDataWithOptimisticTransaction) {
            return {
                baseFilteredData: EMPTY_DATA,
                filteredDataLength: 0,
                allDataLength: 0,
                hasDeletedTransaction: false,
            };
        }

        const [filtered, allLength, hasDeletedTransactionFromSections] = getSections({
            type,
            data: searchDataWithOptimisticTransaction,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            translate,
            formatPhoneNumber,
            bankAccountList,
            groupBy: validGroupBy,
            reportActions: exportReportActions,
            currentSearch: currentSearchKey,
            archivedReportsIDList: archivedReportsIDSet,
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
            reportAttributesDerivedValue,
            optimisticTransactionID,
        });
        return {
            baseFilteredData: filtered as SearchListItem[],
            filteredDataLength: filtered.length,
            allDataLength: allLength,
            hasDeletedTransaction: hasDeletedTransactionFromSections,
        };
    })();

    // Stage 2: for grouped views, fetch each group's sub-snapshot and enrich it with its transactions.
    // validGroupBy guarantees these are group containers (chat/task are guarded out above).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by validGroupBy
    const groupItems = validGroupBy ? (baseFilteredData as TransactionGroupListItemType[]) : EMPTY_GROUP_ITEMS;
    const groupByTransactionHashes = validGroupBy
        ? groupItems.map((item) => hashToString(item.transactionsQueryJSON?.hash)).filter((hashValue): hashValue is string => !!hashValue)
        : EMPTY_HASHES;
    const groupByTransactionSnapshots = useMultipleSnapshots(groupByTransactionHashes);

    const filteredData = ((): SearchData => {
        if (!validGroupBy || isExpenseReportType) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- snapshot rows are a SearchData subset
            return baseFilteredData as SearchData;
        }
        return groupItems.map((item) => {
            const subSnapshot = groupByTransactionSnapshots[hashToString(item.transactionsQueryJSON?.hash) ?? ''];
            if (!subSnapshot?.data) {
                return item;
            }
            const [groupTransactions] = getSections({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                data: subSnapshot.data,
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group children are flat transactions
                transactions: groupTransactions as TransactionListItemType[],
            };
        });
    })();

    // Stage 3: sort the (enriched) data, then stamp the post-create highlight on each row. getSortedSections
    // accepts the full section union; our SearchListItem[] is a compatible subset of that input.
    const chartData = ((): SearchListItem[] => {
        if (!shouldComputeSections) {
            return EMPTY_DATA;
        }
        const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
        return getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder, validGroupBy, {
            policyCategories,
            fallbackPolicyID: policyForMovingExpensesID,
        }).map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- chat variant rows are report actions
            const reportActionID = (item as ReportActionListItemType).reportActionID;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- non-chat variant rows carry a transactionID
            const transactionID = (item as TransactionListItemType).transactionID;
            const baseKey = isChat ? `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionID}` : `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;

            const isBaseKeyMatch = !!newSearchResultKeys?.has(baseKey);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group rows expose nested transactions
            const groupTransactionsForHighlight = (item as TransactionGroupListItemType)?.transactions;
            const isAnyTransactionMatch =
                !isChat &&
                groupTransactionsForHighlight?.some((transaction) => {
                    const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`;
                    return !!newSearchResultKeys?.has(transactionKey);
                });

            const shouldAnimateInHighlight = isBaseKeyMatch || isAnyTransactionMatch;

            if (item.shouldAnimateInHighlight === shouldAnimateInHighlight && item.hash === hash) {
                return item;
            }

            return {...item, shouldAnimateInHighlight, hash};
        });
    })();

    // Phase 2 (cached re-injection): keep the optimistic row visible across a snapshot-replacement gap
    // for up to OPTIMISTIC_ROLLBACK_GRACE_MS until the new snapshot picks it up or the grace expires.
    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    const columns = ((): SearchColumnType[] => {
        if (!searchResults?.data) {
            return EMPTY_COLUMNS;
        }
        return getColumnsToShow({
            currentAccountID: accountID,
            data: searchResults.data,
            visibleColumns,
            type: searchDataType,
            groupBy: validGroupBy,
            shouldUseStrictDefaultExpenseColumns: currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && isDefaultExpensesQuery(queryJSON),
            policyCategories,
            fallbackPolicyID: policyForMovingExpensesID,
        });
    })();

    // Non-grouped views are always fully loaded; grouped views require every group's sub-snapshot to
    // report no further results.
    const hasLoadedAllTransactions = !validGroupBy
        ? true
        : groupItems.every((item) => {
              const subSnapshot =
                  item.transactionsQueryJSON?.hash || item.transactionsQueryJSON?.hash === 0 ? groupByTransactionSnapshots[String(item.transactionsQueryJSON.hash)] : undefined;
              return item.transactions.length === 0 || !subSnapshot || !subSnapshot?.search?.hasMoreResults;
          });

    return {
        data: stableSortedData,
        chartData,
        filteredData,
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
    };
}

export default useSearchSnapshot;
