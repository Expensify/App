import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchListItem, TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
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
import {getColumnsToShow, getSections, getSortedSections, getValidGroupBy} from '@libs/SearchUIUtils';
import {shouldShowAttendees} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {ReportAction} from '@src/types/onyx';
import useOptimisticSearchTracking from './useOptimisticSearchTracking';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

/**
 * Public contract of the Search data layer (Slices S4+S5, callstack-internal/expensify-issues#2546/#2547).
 *
 * Returns row identities plus list-level meta. Never a React component, a render function, or
 * per-row pre-joined display data. Flat-expense rows self-hydrate their display from their own live
 * Onyx subscriptions (verified in `TransactionListItem`), so the live inputs `getSections` still
 * receives are kept only for the sort/group comparators and list-level projection, not for display.
 */
type SearchSnapshotResult = {
    /** Sorted row items for the current query. Rows read identities + ids off these and self-hydrate display. */
    data: SearchListItem[];
    /** Columns to render, derived from the snapshot. */
    columns: SearchColumnType[];
    /** Whether the snapshot is still loading from the server. */
    isLoading: boolean;
    /** Whether the server reports more results beyond the current page. */
    hasMore: boolean;
    /** Whether every transaction (including grouped sub-snapshots) has been loaded. */
    hasLoadedAllTransactions: boolean;
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_COLUMNS: SearchColumnType[] = [];
const EMPTY_HASHES: string[] = [];
const EMPTY_GROUP_ITEMS: TransactionGroupListItemType[] = [];

const hashToString = (queryHash?: number) => (queryHash || queryHash === 0 ? String(queryHash) : undefined);

/**
 * Single data layer for the Search screen.
 *
 * Owns the narrow snapshot subscription plus the live inputs `getSections` needs for sort/group
 * correctness (S3 judged these load-bearing), runs the sort/group/paginate projection, enriches
 * grouped views with their per-group sub-snapshots, and absorbs the two-phase optimistic-row
 * resilience. Returns sorted items + list-level meta.
 *
 * The `useSearchSnapshot(hash)` overload for self-hydrating group rows is intentionally deferred to
 * S6 (#2548), where those group-row consumers ship. Adding it now would be unexercised.
 */
function useSearchSnapshot(queryJSON: Readonly<SearchQueryJSON>): SearchSnapshotResult {
    const {type, status, sortBy, sortOrder, hash, groupBy} = queryJSON;

    // `hash` is a required number, so the interpolated key can never collapse to a bare collection key (C-1).
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    const {isOffline} = useNetwork();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {convertToDisplayString} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();
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

    // Phase 1 needs the full (unfiltered) TRANSACTION + REPORT_ACTIONS collections to resolve the
    // optimistic watch key, swap split-parent -> child, and match the optimistic IOU report action.
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    // Phase 1 (snapshot augmentation): inject an optimistically-created transaction the server has not
    // indexed yet so its row mounts immediately. Composed here; the standalone hook is deleted in S6.
    const {searchDataWithOptimisticTransaction, trackingState} = useOptimisticSearchTracking({searchResults: snapshot, queryJSON, transactions, reportActions});
    const optimisticTransactionID = trackingState.optimisticWatchKey?.toString().replace(ONYXKEYS.COLLECTION.TRANSACTION, '');

    const validGroupBy = getValidGroupBy(groupBy);
    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
    const isExpenseReportType = type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const isLoading = !!snapshot?.search?.isLoading;
    const hasMore = !!snapshot?.search?.hasMoreResults;

    // Stage 1: base sections from the (optimistically augmented) snapshot.
    const baseFilteredData = ((): SearchListItem[] => {
        // Group-by is not valid for chats or tasks; mirror the legacy `<Search>` guard.
        if (!searchDataWithOptimisticTransaction || (validGroupBy && (isChat || isTask))) {
            return EMPTY_DATA;
        }

        const [filtered] = getSections({
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
        return filtered as SearchListItem[];
    })();

    // Stage 2: for grouped views, fetch each group's sub-snapshot and enrich it with its transactions.
    // validGroupBy guarantees these are group containers (chat/task are guarded out above).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by validGroupBy
    const groupItems = validGroupBy ? (baseFilteredData as TransactionGroupListItemType[]) : EMPTY_GROUP_ITEMS;
    const groupByTransactionHashes = validGroupBy
        ? groupItems.map((item) => hashToString(item.transactionsQueryJSON?.hash)).filter((hashValue): hashValue is string => !!hashValue)
        : EMPTY_HASHES;
    const groupByTransactionSnapshots = useMultipleSnapshots(groupByTransactionHashes);

    const filteredData = ((): SearchListItem[] => {
        if (!validGroupBy || isExpenseReportType) {
            return baseFilteredData;
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group children are flat transactions
            return {...item, transactions: groupTransactions as TransactionListItemType[]};
        });
    })();

    // Stage 3: sort the (enriched) data. getSortedSections accepts the full section union; our
    // SearchListItem[] is a compatible subset of that input.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- compatible section data
    const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
    const sortedData =
        !searchDataWithOptimisticTransaction || (validGroupBy && (isChat || isTask))
            ? EMPTY_DATA
            : (getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder, validGroupBy, {
                  policyCategories,
                  fallbackPolicyID: policyForMovingExpensesID,
              }) as SearchListItem[]);

    // Phase 2 (cached re-injection): keep the optimistic row visible across a snapshot-replacement gap
    // for up to OPTIMISTIC_ROLLBACK_GRACE_MS until the new snapshot picks it up or the grace expires.
    const {stableSortedData} = useStableOptimisticSortedData(sortedData, snapshot, trackingState);

    const columns = ((): SearchColumnType[] => {
        if (!snapshot?.data) {
            return EMPTY_COLUMNS;
        }
        return getColumnsToShow({
            currentAccountID: accountID,
            data: snapshot.data,
            visibleColumns,
            type: snapshot?.search?.type ?? type,
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
        columns,
        isLoading,
        hasMore,
        hasLoadedAllTransactions,
    };
}

export default useSearchSnapshot;
