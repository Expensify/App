import type {OnyxEntry} from 'react-native-onyx';
import {selectFilteredReportActions} from '@libs/ReportUtils';
import {getSections, getSortedSections} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';
import useActionLoadingReportIDs from './useActionLoadingReportIDs';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useTodos from './useTodos';

const TODO_SEARCH_KEYS: SearchKey[] = [CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY, CONST.SEARCH.SEARCH_KEYS.EXPORT];

type UseSearchSectionsResult = {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

function useSearchSections(): UseSearchSectionsResult {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [snapshotSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);
    const todoSearchResultsData = useTodos();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {localeCompare, formatPhoneNumber, translate} = useLocalize();
    const isActionLoadingSet = useActionLoadingReportIDs();

    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        canEvict: false,
        selector: selectFilteredReportActions,
    });

    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const archivedReportsIdSet = useArchivedReportsIdSet();

    const {type, status, sortBy, sortOrder, groupBy} = lastSearchQuery?.queryJSON ?? {};
    const currentAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const searchKey = lastSearchQuery?.searchKey;

    // For To Do searches, use live data from useTodos instead of the API snapshot.
    // This ensures navigation arrows are available immediately since To Do data is always in Onyx.
    const isTodoSearchKey = !!searchKey && TODO_SEARCH_KEYS.includes(searchKey);
    let currentSearchResults: SearchResults | undefined;
    if (isTodoSearchKey) {
        const liveData = todoSearchResultsData[searchKey as keyof typeof todoSearchResultsData];
        if (Object.keys(liveData.data).length > 0) {
            currentSearchResults = {
                search: {
                    offset: 0,
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                    hasMoreResults: false,
                    hasResults: true,
                    isLoading: false,
                    count: liveData.metadata.count,
                    total: liveData.metadata.total,
                    currency: liveData.metadata.currency ?? '',
                },
                data: liveData.data,
            };
        }
    }
    if (!currentSearchResults) {
        currentSearchResults = snapshotSearchResults ?? undefined;
    }

    const searchResultsData = currentSearchResults?.data;
    const searchResultsSearch = currentSearchResults?.search;

    let allReports: Array<string | undefined> = [];
    if (!!type && !!searchResultsData && !!searchResultsSearch) {
        const [searchData] = getSections({
            type,
            data: searchResultsData,
            currentAccountID,
            currentUserEmail,
            translate,
            formatPhoneNumber,
            bankAccountList,
            groupBy,
            reportActions: exportReportActions,
            currentSearch: searchKey,
            archivedReportsIDList: archivedReportsIdSet,
            isActionLoadingSet,
            cardFeeds,
            allReportMetadata,
            cardList,
        });
        allReports = getSortedSections(type, status ?? '', searchData, localeCompare, translate, sortBy, sortOrder, groupBy).map((value) => value.reportID);
    }

    return {allReports, isSearchLoading: !!currentSearchResults?.search?.isLoading, lastSearchQuery};
}

export default useSearchSections;
