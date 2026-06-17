import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import useArchivedReportsIDSet from '@hooks/useArchivedReportsIDSet';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
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

/**
 * Single data layer for the Search screen.
 *
 * This commit lands the snapshot-only projection: the narrow snapshot subscription plus the
 * sort/group/paginate projection via `getSections` + `getSortedSections`, returning the sorted items
 * and meta. The hook owns the snapshot plus the live inputs `getSections` needs for sort/group
 * correctness (S3 judged these load-bearing).
 *
 * Follow-up commits on this PR:
 * - Absorb optimistic Phase 1 (snapshot augmentation) and Phase 2 (3s re-injection).
 * - Grouped sub-snapshot enrichment + accurate `hasLoadedAllTransactions` (currently flat-first).
 * - `useSearchSnapshot(hash)` overload for group sub-snapshots (must use the conditional-key C-1 form).
 */
function useSearchSnapshot(queryJSON: Readonly<SearchQueryJSON>): SearchSnapshotResult {
    const {type, status, sortBy, sortOrder, hash, groupBy} = queryJSON;

    // `hash` is a required number, so the interpolated key can never collapse to a bare collection
    // key (C-1). The future group overload accepts a hash that can be undefined and must guard with
    // the conditional `hash ? key : undefined` form before subscribing.
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
    // These mirror the screen-level subscriptions in <Search>.
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    // Phase 1 (snapshot augmentation): inject an optimistically-created transaction the server has not
    // indexed yet so its row mounts immediately. Composed here rather than inlined; the standalone hook
    // is deleted in S6 once legacy <Search> no longer renders any path through it.
    const {searchDataWithOptimisticTransaction, trackingState} = useOptimisticSearchTracking({searchResults: snapshot, queryJSON, transactions, reportActions});
    const optimisticTransactionID = trackingState.optimisticWatchKey?.toString().replace(ONYXKEYS.COLLECTION.TRANSACTION, '');

    const validGroupBy = getValidGroupBy(groupBy);
    const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
    const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;

    const isLoading = !!snapshot?.search?.isLoading;
    const hasMore = !!snapshot?.search?.hasMoreResults;

    const sortedData = ((): SearchListItem[] => {
        // Group-by is not valid for chats or tasks; mirror the legacy `<Search>` guard.
        if (!searchDataWithOptimisticTransaction || (validGroupBy && (isChat || isTask))) {
            return EMPTY_DATA;
        }

        const [filteredData] = getSections({
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

        return getSortedSections(type, status, filteredData, localeCompare, translate, sortBy, sortOrder, validGroupBy, {
            policyCategories,
            fallbackPolicyID: policyForMovingExpensesID,
        }) as SearchListItem[];
    })();

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

    // TODO(#2548): grouped views must check every group's sub-snapshot `hasMoreResults`; flat-first here.
    const hasLoadedAllTransactions = !validGroupBy || !hasMore;

    return {
        data: stableSortedData,
        columns,
        isLoading,
        hasMore,
        hasLoadedAllTransactions,
    };
}

export default useSearchSnapshot;
export type {SearchSnapshotResult};
