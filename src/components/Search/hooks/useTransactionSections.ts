import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import {getTransactionRowShouldAnimate, stampSearchHighlights} from '@components/Search/searchSectionHighlights';
import type {SearchData, SearchQueryJSON} from '@components/Search/types';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {selectFilteredReportActions} from '@libs/ReportUtils';
import {getSortedSections, getTransactionsSections} from '@libs/SearchUIUtils';
import {shouldShowAttendees} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {SearchSections} from './useExpenseReportSections';
import type {SearchShell} from './useSearchShell';

import useSearchSectionColumns from './useSearchSectionColumns';
import useStableOptimisticSortedData from './useStableOptimisticSortedData';

type UseTransactionSectionsParams = {
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
 * Section builder for the flat transaction search views (`type` of expense/invoice/trip, no group-by). These
 * types all route through `getTransactionsSections` and share the same sort/columns path.
 */
function useTransactionSections({shell, queryJSON, searchResults, newSearchResultKeys}: UseTransactionSectionsParams): SearchSections {
    const {type, sortBy, sortOrder, hash} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState, optimisticTransactionID} = shell;

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {currentSearchKey} = useSearchQueryContext();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const {policyForMovingExpensesID, policyForMovingExpenses} = usePolicyForMovingExpenses();
    const isAttendeesEnabledForMovingPolicy = shouldShowAttendees(CONST.IOU.TYPE.SUBMIT, policyForMovingExpenses);

    const [exportReportActions] = useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction[]> | undefined>(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: selectFilteredReportActions,
    });
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);

    let filteredData: SearchData = EMPTY_FILTERED_DATA;
    let filteredDataLength = 0;
    let allDataLength = 0;
    let hasDeletedTransaction = false;
    if (shouldComputeSections && searchDataWithOptimisticTransaction) {
        const [filtered, allLength, hasDeletedTransactionFromSections] = getTransactionsSections({
            data: searchDataWithOptimisticTransaction,
            currentSearch: currentSearchKey ?? CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            translate,
            formatPhoneNumber,
            isActionLoadingSet,
            bankAccountList,
            reportActions: exportReportActions,
            queryJSON,
            isAttendeesEnabledForMovingPolicy,
            optimisticTransactionID,
        });
        filteredData = filtered as SearchData;
        filteredDataLength = filtered.length;
        allDataLength = allLength;
        hasDeletedTransaction = hasDeletedTransactionFromSections;
    }

    const chartData: SearchListItem[] = !shouldComputeSections
        ? EMPTY_DATA
        : stampSearchHighlights(
              getSortedSections(type, filteredData as Parameters<typeof getSortedSections>[1], localeCompare, translate, sortBy, sortOrder, undefined, {
                  policyCategories,
                  policyTags,
                  fallbackPolicyID: policyForMovingExpensesID,
              }),
              hash,
              (item) => getTransactionRowShouldAnimate(item, newSearchResultKeys),
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
        hasCachedOptimisticItem,
    };
}

export default useTransactionSections;
