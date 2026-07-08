import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchListItem, TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
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

import {useMemo} from 'react';

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
 *
 * Subscribes to ONLY the slice the transaction builder reads (report actions, bank accounts, visible
 * columns, and the policy category/tag lookups needed for GL-code sorting) and reads locale/account from
 * context directly. Because this hook mounts only inside `TransactionSectionsContainer` — i.e. only when a
 * flat transaction search is active — those subscriptions are closed for every other search type. It reuses
 * the shared optimistic tracking + gate from `shell`.
 */
function useTransactionSections({shell, queryJSON, searchResults, newSearchResultKeys}: UseTransactionSectionsParams): SearchSections {
    const {type, status, sortBy, sortOrder, hash} = queryJSON;
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

    // Stage 1: base sections from the (optimistically augmented) snapshot.
    // Memoized explicitly: React Compiler caches the inline callbacks but NOT the getTransactionsSections call
    // result, so without useMemo each render returns a fresh array. An unstable `filteredData` reference
    // drives useStableOptimisticSortedData's setState effect into an infinite render loop during the
    // optimistic-create flow ("Maximum update depth exceeded").
    const {filteredData, filteredDataLength, allDataLength, hasDeletedTransaction} = useMemo<{
        filteredData: SearchData;
        filteredDataLength: number;
        allDataLength: number;
        hasDeletedTransaction: boolean;
    }>(() => {
        if (!shouldComputeSections || !searchDataWithOptimisticTransaction) {
            return {filteredData: EMPTY_FILTERED_DATA, filteredDataLength: 0, allDataLength: 0, hasDeletedTransaction: false};
        }

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
            queryType: queryJSON?.type,
            queryStatus: queryJSON?.status,
            isAttendeesEnabledForMovingPolicy,
            optimisticTransactionID,
        });

        return {
            filteredData: filtered as SearchData,
            filteredDataLength: filtered.length,
            allDataLength: allLength,
            hasDeletedTransaction: hasDeletedTransactionFromSections,
        };
    }, [
        shouldComputeSections,
        searchDataWithOptimisticTransaction,
        currentSearchKey,
        accountID,
        email,
        translate,
        formatPhoneNumber,
        isActionLoadingSet,
        bankAccountList,
        exportReportActions,
        queryJSON?.type,
        queryJSON?.status,
        isAttendeesEnabledForMovingPolicy,
        optimisticTransactionID,
    ]);

    // Stage 2: sort the flat transaction rows, then stamp the post-create highlight on each row. Flat
    // expense rows carry a transactionID and never nest transactions, so the highlight matches on the base
    // transaction key.
    const chartData = useMemo<SearchListItem[]>(() => {
        if (!shouldComputeSections) {
            return EMPTY_DATA;
        }
        const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
        return getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder, undefined, {
            policyCategories,
            policyTags,
            fallbackPolicyID: policyForMovingExpensesID,
        }).map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- transaction rows carry a transactionID
            const transactionID = (item as TransactionListItemType).transactionID;
            const baseKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
            const isBaseKeyMatch = !!newSearchResultKeys?.has(baseKey);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group rows expose nested transactions
            const groupTransactionsForHighlight = (item as TransactionGroupListItemType)?.transactions;
            const isAnyTransactionMatch = groupTransactionsForHighlight?.some((transaction) => !!newSearchResultKeys?.has(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`));

            const shouldAnimateInHighlight = isBaseKeyMatch || !!isAnyTransactionMatch;

            if (item.shouldAnimateInHighlight === shouldAnimateInHighlight && item.hash === hash) {
                return item;
            }
            return {...item, shouldAnimateInHighlight, hash};
        });
    }, [shouldComputeSections, filteredData, type, status, localeCompare, translate, sortBy, sortOrder, policyCategories, policyTags, policyForMovingExpensesID, newSearchResultKeys, hash]);

    // Keep the optimistic row visible across a snapshot-replacement gap.
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
        // The flat expense view is never grouped, so it is always fully loaded.
        hasLoadedAllTransactions: true,
        hasCachedOptimisticItem,
    };
}

export default useTransactionSections;
export type {UseTransactionSectionsParams};
