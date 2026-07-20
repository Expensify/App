import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import {getTransactionRowShouldAnimate, stampSearchHighlights} from '@components/Search/searchSectionHighlights';
import type {SearchColumnType, SearchData, SearchQueryJSON} from '@components/Search/types';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {selectFilteredReportActions} from '@libs/ReportUtils';
import {getReportSections, getSortedSections} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {SearchShell} from './useSearchShell';

import useSearchSectionColumns from './useSearchSectionColumns';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

/**
 * The section outputs every per-type Search leaf produces, handed to the shared results body.
 */
type SearchSections = {
    /** Sorted and optimistic-stabilized row items for the current query. */
    data: SearchListItem[];
    /** Sorted row items BEFORE optimistic stabilization. The chart view consumes this, not `data`. */
    chartData: SearchListItem[];
    /** Group-enriched sections before sort. Consumed for selection counts and bulk-action wiring. */
    filteredData: SearchData;
    /** Length of the base (pre-sort) sections (used as `prevReportsLength` when firing the next search). */
    filteredDataLength: number;
    /** Total result count (drives the pagination guard). */
    allDataLength: number;
    /** Whether any visible transaction is deleted (widens the action column). Omitted by non-transaction views (defaults false). */
    hasDeletedTransaction?: boolean;
    /** Columns to render, derived from the snapshot. */
    columns: SearchColumnType[];
    /** Whether every transaction has been loaded. Omitted by non-paginated views (defaults true). */
    hasLoadedAllTransactions?: boolean;
    /** True while the cached optimistic row is being re-injected across a snapshot-replacement gap. */
    hasCachedOptimisticItem: boolean;
};

type UseExpenseReportSectionsParams = {
    /** Shared type-agnostic core (optimistic tracking + the compute gate). */
    shell: SearchShell;
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot, owned by the ancestor and passed in. */
    searchResults: SearchResults | undefined;
    /** Keys flagged for the post-create highlight animation. */
    newSearchResultKeys: Set<string> | null | undefined;
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_FILTERED_DATA: SearchData = [];

/**
 * Section builder for the expense-report search view (`type === EXPENSE_REPORT`, no group-by).
 *
 * Subscribes to ONLY the slice the report builder reads (report actions, bank accounts, personal details)
 * and reads locale/account/network from context directly. Because this hook mounts only inside
 * `ExpenseReportSearchContainer` — i.e. only when a report search is active — those subscriptions are closed
 * for every other search type. It reuses the shared optimistic tracking + gate from `shell`.
 */
function useExpenseReportSections({shell, queryJSON, searchResults, newSearchResultKeys}: UseExpenseReportSectionsParams): SearchSections {
    const {type, sortBy, sortOrder, hash} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState} = shell;

    const {isOffline} = useNetwork();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {convertToDisplayString} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();
    const isActionLoadingSet = useActionLoadingReportIDs();

    const [exportReportActions] = useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction[]> | undefined>(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: selectFilteredReportActions,
    });
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [onyxPersonalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    let filteredData: SearchData = EMPTY_FILTERED_DATA;
    let filteredDataLength = 0;
    let allDataLength = 0;
    let hasDeletedTransaction = false;
    if (shouldComputeSections && searchDataWithOptimisticTransaction) {
        const [filtered, allLength, hasDeletedTransactionFromSections] = getReportSections({
            data: searchDataWithOptimisticTransaction,
            currentSearch: currentSearchKey ?? CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            translate,
            isOffline,
            formatPhoneNumber,
            isActionLoadingSet,
            bankAccountList,
            reportActions: exportReportActions,
            queryJSON,
            onyxPersonalDetailsList,
            convertToDisplayString,
        });
        filteredData = filtered as SearchData;
        filteredDataLength = filtered.length;
        allDataLength = allLength;
        hasDeletedTransaction = hasDeletedTransactionFromSections;
    }

    const chartData: SearchListItem[] = !shouldComputeSections
        ? EMPTY_DATA
        : stampSearchHighlights(getSortedSections(type, filteredData as Parameters<typeof getSortedSections>[1], localeCompare, translate, sortBy, sortOrder), hash, (item) =>
              getTransactionRowShouldAnimate(item, newSearchResultKeys),
          );

    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    const columns = useSearchSectionColumns(queryJSON, searchResults);

    return {
        data: stableSortedData,
        chartData,
        filteredData,
        filteredDataLength,
        allDataLength,
        hasDeletedTransaction,
        columns,
        // The report view is never grouped, so it is always fully loaded.
        hasLoadedAllTransactions: true,
        hasCachedOptimisticItem,
    };
}

export default useExpenseReportSections;
export type {SearchSections};
