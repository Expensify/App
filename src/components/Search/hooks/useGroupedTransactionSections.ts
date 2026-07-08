import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchListItem, TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {getTransactionRowShouldAnimate, stampSearchHighlights} from '@components/Search/searchSectionHighlights';
import type {SearchData, SearchQueryJSON} from '@components/Search/types';

import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMultipleSnapshots from '@hooks/useMultipleSnapshots';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportAttributes from '@hooks/useReportAttributes';

import {selectFilteredReportActions} from '@libs/ReportUtils';
import {getSections, getSortedSections, getValidGroupBy} from '@libs/SearchUIUtils';
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

type UseGroupedTransactionSectionsParams = {
    /** Shared type-agnostic core (optimistic tracking + the compute gate). */
    shell: SearchShell;
    queryJSON: Readonly<SearchQueryJSON>;
    /** The current search snapshot, owned by the ancestor and passed in. */
    searchResults: SearchResults | undefined;
    /** Keys flagged for the post-create highlight animation. */
    newSearchResultKeys: Set<string> | null | undefined;
};

const EMPTY_DATA: SearchListItem[] = [];
const EMPTY_HASHES: string[] = [];
const EMPTY_GROUP_ITEMS: TransactionGroupListItemType[] = [];

const hashToString = (queryHash?: number) => (queryHash || queryHash === 0 ? String(queryHash) : undefined);

/**
 * Section builder for the grouped transaction search views (`type` of expense/invoice/trip WITH a valid
 * group-by).
 *
 * Grouped views are the heavy path: they build group rows, then fetch each group's sub-snapshot and enrich it
 * with that group's child transactions. Different group-by dimensions read different data (card feeds for
 * `card`, personal details for `from`, etc.), so this leaf subscribes to the union of what any group builder
 * needs. It reuses the shared optimistic tracking + gate from `shell`.
 */
function useGroupedTransactionSections({shell, queryJSON, searchResults, newSearchResultKeys}: UseGroupedTransactionSectionsParams): SearchSections {
    const {type, status, sortBy, sortOrder, hash, groupBy} = queryJSON;
    const {shouldComputeSections, searchDataWithOptimisticTransaction, trackingState, optimisticTransactionID} = shell;
    const validGroupBy = getValidGroupBy(groupBy);

    const {isOffline} = useNetwork();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, email} = useCurrentUserPersonalDetails();
    const {convertToDisplayString} = useCurrencyListActions();
    const {currentSearchKey} = useSearchQueryContext();
    const isActionLoadingSet = useActionLoadingReportIDs();
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
    const [policyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    const {baseFilteredData, filteredDataLength, allDataLength, hasDeletedTransaction} = useMemo<{
        baseFilteredData: TransactionGroupListItemType[];
        filteredDataLength: number;
        allDataLength: number;
        hasDeletedTransaction: boolean;
    }>(() => {
        if (!shouldComputeSections || !searchDataWithOptimisticTransaction) {
            return {baseFilteredData: EMPTY_GROUP_ITEMS, filteredDataLength: 0, allDataLength: 0, hasDeletedTransaction: false};
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
            reportNameValuePairs,
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- grouped views yield group containers
            baseFilteredData: filtered as TransactionGroupListItemType[],
            filteredDataLength: filtered.length,
            allDataLength: allLength,
            hasDeletedTransaction: hasDeletedTransactionFromSections,
        };
    }, [
        shouldComputeSections,
        searchDataWithOptimisticTransaction,
        type,
        accountID,
        email,
        translate,
        formatPhoneNumber,
        bankAccountList,
        validGroupBy,
        exportReportActions,
        currentSearchKey,
        reportNameValuePairs,
        queryJSON,
        isActionLoadingSet,
        cardFeeds,
        personalAndWorkspaceCards,
        nonPersonalAndWorkspaceCards,
        isOffline,
        customCardNames,
        conciergeReportID,
        onyxPersonalDetailsList,
        isAttendeesEnabledForMovingPolicy,
        convertToDisplayString,
        reportAttributesDerivedValue,
        optimisticTransactionID,
    ]);

    const groupByTransactionHashes = useMemo(
        () => (validGroupBy ? baseFilteredData.map((item) => hashToString(item.transactionsQueryJSON?.hash)).filter((hashValue): hashValue is string => !!hashValue) : EMPTY_HASHES),
        [validGroupBy, baseFilteredData],
    );
    const groupByTransactionSnapshots = useMultipleSnapshots(groupByTransactionHashes);

    const filteredData = useMemo<SearchData>(() => {
        if (!validGroupBy) {
            return baseFilteredData as SearchData;
        }
        return baseFilteredData.map((item) => {
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
                reportAttributesDerivedValue: undefined,
            });
            return {
                ...item,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group children are flat transactions
                transactions: groupTransactions as TransactionListItemType[],
            };
        });
    }, [
        validGroupBy,
        baseFilteredData,
        groupByTransactionSnapshots,
        accountID,
        email,
        bankAccountList,
        translate,
        formatPhoneNumber,
        isActionLoadingSet,
        cardFeeds,
        conciergeReportID,
        convertToDisplayString,
    ]);

    const chartData = useMemo<SearchListItem[]>(() => {
        if (!shouldComputeSections) {
            return EMPTY_DATA;
        }
        const sortInput = filteredData as Parameters<typeof getSortedSections>[2];
        const sorted = getSortedSections(type, status, sortInput, localeCompare, translate, sortBy, sortOrder, validGroupBy, {
            policyCategories,
            policyTags,
            fallbackPolicyID: policyForMovingExpensesID,
        });
        return stampSearchHighlights(sorted, hash, (item) => getTransactionRowShouldAnimate(item, newSearchResultKeys));
    }, [
        shouldComputeSections,
        filteredData,
        type,
        status,
        localeCompare,
        translate,
        sortBy,
        sortOrder,
        validGroupBy,
        policyCategories,
        policyTags,
        policyForMovingExpensesID,
        newSearchResultKeys,
        hash,
    ]);

    const {stableSortedData, hasCachedOptimisticItem} = useStableOptimisticSortedData(chartData, searchResults, trackingState);

    const columns = useSearchSectionColumns(queryJSON, searchResults, validGroupBy);

    // Grouped views require every group's sub-snapshot to report no further results.
    const hasLoadedAllTransactions = !validGroupBy
        ? true
        : baseFilteredData.every((item) => {
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
        hasLoadedAllTransactions,
        hasCachedOptimisticItem,
    };
}

export default useGroupedTransactionSections;
export type {UseGroupedTransactionSectionsParams};
