import {getSections, getSortedSections} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {OnyxEntry} from 'react-native-onyx';

import useActionLoadingReportIDs from './useActionLoadingReportIDs';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useFilterPendingDeleteReports from './useFilterPendingDeleteReports';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useReportAttributes from './useReportAttributes';

type UseSearchSectionsResult = {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

/**
 * @param contextReports Pre-computed report IDs from the search context. When these are available and no
 * pagination/refresh is in flight, they are returned as-is and the expensive getSections/getSortedSections
 * rebuild is skipped entirely — the fast path after opening a report from search.
 */
function useSearchSections(contextReports: Array<string | undefined> = []): UseSearchSectionsResult {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);
    const isSearchLoading = !!currentSearchResults?.search?.isLoading;

    // Fast path: the pre-computed context IDs are usable and no page is loading, so we never need the
    // full section rebuild/sort below.
    const shouldUseContextReports = contextReports.length > 0 && !isSearchLoading;

    const currentUserDetails = useCurrentUserPersonalDetails();
    const {localeCompare, formatPhoneNumber, translate} = useLocalize();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const {convertToDisplayString} = useCurrencyListActions();

    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [personalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [nonPersonalAndWorkspaceCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const reportAttributesDerivedValue = useReportAttributes();

    const {type, status, sortBy, sortOrder, groupBy} = lastSearchQuery?.queryJSON ?? {};
    const searchResultsData = currentSearchResults?.data;
    const searchResultsSearch = currentSearchResults?.search;
    const currentAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const searchKey = lastSearchQuery?.searchKey;

    let results: Array<string | undefined> = [];
    if (!shouldUseContextReports && !!type && !!searchResultsData && !!searchResultsSearch) {
        const [searchData] = getSections({
            type,
            data: searchResultsData,
            currentAccountID,
            currentUserEmail,
            translate,
            formatPhoneNumber,
            bankAccountList,
            groupBy,
            currentSearch: searchKey,
            reportNameValuePairs,
            isActionLoadingSet,
            cardFeeds,
            cardList: personalAndWorkspaceCards,
            nonPersonalAndWorkspaceCardList: nonPersonalAndWorkspaceCards,
            conciergeReportID,
            convertToDisplayString,
            reportAttributesDerivedValue,
        });
        results = getSortedSections(type, status ?? '', searchData, localeCompare, translate, sortBy, sortOrder, groupBy).map((value) => value.reportID);
    }

    const standaloneReports = useFilterPendingDeleteReports(results);
    return {allReports: shouldUseContextReports ? contextReports : standaloneReports, isSearchLoading, lastSearchQuery};
}

export default useSearchSections;
