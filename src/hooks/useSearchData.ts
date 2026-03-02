import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import {selectFilteredReportActions} from '@libs/ReportUtils';
import {getColumnsToShow, getSections, getSuggestedSearches} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SaveSearch} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import useActionLoadingReportIDs from './useActionLoadingReportIDs';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type UseSearchDataParams = {
    queryJSON: SearchQueryJSON;
    searchResults: SearchResults | undefined;
    isDataLoaded: boolean;
    shouldUseLiveData?: boolean;
    searchRequestResponseStatusCode?: number | null;
};

type UseSearchDataResult = {
    /** Formatted section data ready for the list */
    sections: ReturnType<typeof getSections>[0];
    /** Total count of all items across all pages */
    allDataLength: number;
    /** Count of items in the current page */
    filteredDataLength: number;
    /** Visible columns computed from user preferences and data */
    columns: ReturnType<typeof getColumnsToShow>;
    /** Card feed names keyed by fundID */
    customCardNames: Record<number, string> | undefined;
    /** Transaction violations collection */
    violations: ReturnType<typeof useOnyx<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>>[0];
    /** Report actions filtered for export icons */
    exportReportActions: ReturnType<typeof useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>[0];
    /** Card feeds collection */
    cardFeeds: ReturnType<typeof useOnyx<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>>[0];
    /** Whether card feeds are still loading (relevant for GROUP_BY.CARD) */
    cardFeedsLoading: boolean;
    /** The key of the current saved/suggested search, used for search requests */
    searchKey: string | undefined;
    /** Name of the current saved search for chart title */
    savedSearchName: string | undefined;
    /** All transactions, needed by useSearchHighlightAndScroll */
    transactions: ReturnType<typeof useOnyx<typeof ONYXKEYS.COLLECTION.TRANSACTION>>[0];
    /** All report actions, needed by useSearchHighlightAndScroll */
    reportActions: ReturnType<typeof useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>[0];
    /** Outstanding reports by policy, needed for selection state computation */
    outstandingReportsByPolicyID: ReturnType<typeof useOnyx<typeof ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID>>[0];
    /** Whether the user has dismissed the intro (affects transaction thread creation) */
    introSelected: ReturnType<typeof useOnyx<typeof ONYXKEYS.NVP_INTRO_SELECTED>>[0];
    /** Suggested search type menu items */
    suggestedSearches: ReturnType<typeof getSuggestedSearches>;
    /** Current user's account ID */
    accountID: number;
    /** Current user's login email */
    login: string | undefined;
    /** Bank account list, needed for group-by enrichment */
    bankAccountList: ReturnType<typeof useOnyx<typeof ONYXKEYS.BANK_ACCOUNT_LIST>>[0];
    /** Action loading report IDs set, needed for group-by enrichment */
    isActionLoadingSet: ReadonlySet<string>;
    /** All report metadata, needed for group-by enrichment */
    allReportMetadata: ReturnType<typeof useOnyx<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>>[0];
    /** Card list, needed for group-by enrichment */
    cardList: ReturnType<typeof useOnyx<typeof ONYXKEYS.CARD_LIST>>[0];
    /** The resolved search data type (expense_report when using live data) */
    searchDataType: SearchDataTypes | undefined;
    /** Whether the search response has errors (and we're not offline) */
    hasErrors: boolean;
    /** Whether to show the full-page loading state */
    shouldShowLoadingState: boolean;
    /** Whether to show "loading more" at the bottom (pagination) */
    shouldShowLoadingMoreItems: boolean;
};

/**
 * Consolidates all Onyx subscriptions needed by the Search component and
 * computes section data + column visibility in one place.
 *
 * The component can then focus purely on selection state, bulk actions,
 * scroll handling, and navigation.
 */
function useSearchData({
    queryJSON,
    searchResults,
    isDataLoaded,
    shouldUseLiveData,
    searchRequestResponseStatusCode,
}: UseSearchDataParams): UseSearchDataResult {
    const {type, hash, recentSearchHash, groupBy} = queryJSON;
    const validGroupBy = groupBy && Object.values(CONST.SEARCH.GROUP_BY).includes(groupBy) ? groupBy : undefined;

    const {isOffline} = useNetwork();
    const {translate, formatPhoneNumber} = useLocalize();
    const {accountID, email, login} = useCurrentUserPersonalDetails();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const {defaultCardFeed} = useCardFeedsForDisplay();

    // --- Onyx subscriptions ---
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [violations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        selector: selectFilteredReportActions,
    });
    const [cardFeeds, cardFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const savedSearchSelector = useCallback((searches: OnyxEntry<SaveSearch>) => searches?.[hash], [hash]);
    const [savedSearch] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {selector: savedSearchSelector});

    // --- Derived values ---
    const suggestedSearches = useMemo(() => getSuggestedSearches(accountID, defaultCardFeed?.id), [defaultCardFeed?.id, accountID]);
    const searchKey = useMemo(() => Object.values(suggestedSearches).find((search) => search.recentSearchHash === recentSearchHash)?.key, [suggestedSearches, recentSearchHash]);

    let savedSearchName: string | undefined;
    if (savedSearch?.name && savedSearch.name !== savedSearch.query) {
        savedSearchName = savedSearch.name;
    } else if (searchKey && suggestedSearches[searchKey]) {
        savedSearchName = translate(suggestedSearches[searchKey].translationPath);
    }

    const cardFeedsLoading = validGroupBy === CONST.SEARCH.GROUP_BY.CARD && cardFeedsResult?.status === 'loading';

    const searchDataType: SearchDataTypes | undefined = shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type;

    const hasErrors = Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline;

    const shouldShowLoadingState =
        !shouldUseLiveData &&
        !isOffline &&
        (!isDataLoaded ||
            (!!searchResults?.search?.isLoading && Array.isArray(searchResults?.data) && searchResults?.data.length === 0) ||
            (hasErrors && searchRequestResponseStatusCode === null) ||
            cardFeedsLoading);

    const shouldShowLoadingMoreItems =
        !shouldShowLoadingState && !!searchResults?.search?.isLoading && (searchResults?.search?.offset ?? 0) > 0;

    // --- Section building ---
    const [sections, allDataLength] = useMemo(() => {
        if (searchResults === undefined || !isDataLoaded) {
            return [[], 0] as [[], 0];
        }

        const isChat = type === CONST.SEARCH.DATA_TYPES.CHAT;
        const isTask = type === CONST.SEARCH.DATA_TYPES.TASK;
        if (validGroupBy && (isChat || isTask)) {
            return [[], 0] as [[], 0];
        }

        return getSections({
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
            currentSearch: searchKey,
            archivedReportsIDList: archivedReportsIdSet,
            queryJSON,
            isActionLoadingSet,
            cardFeeds,
            isOffline,
            allTransactionViolations: violations,
            customCardNames,
            allReportMetadata,
            cardList,
        });
    }, [
        searchKey,
        isOffline,
        exportReportActions,
        validGroupBy,
        isDataLoaded,
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
        cardList,
    ]);

    const filteredDataLength = sections.length;

    // --- Column visibility ---
    const searchResultsData = searchResults?.data;
    const columns = useMemo(() => {
        if (!searchResultsData) {
            return [];
        }
        return getColumnsToShow(accountID, searchResultsData, visibleColumns, false, searchDataType, validGroupBy);
    }, [accountID, searchResultsData, searchDataType, visibleColumns, validGroupBy]);

    return {
        sections,
        allDataLength,
        filteredDataLength,
        columns,
        customCardNames,
        violations,
        exportReportActions,
        cardFeeds,
        cardFeedsLoading,
        searchKey,
        savedSearchName,
        transactions,
        reportActions,
        outstandingReportsByPolicyID,
        introSelected,
        suggestedSearches,
        accountID,
        login,
        bankAccountList,
        isActionLoadingSet,
        allReportMetadata,
        cardList,
        searchDataType,
        hasErrors,
        shouldShowLoadingState,
        shouldShowLoadingMoreItems,
    };
}

export default useSearchData;
