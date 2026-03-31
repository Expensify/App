import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isReportPendingDelete, selectFilteredReportActions} from '@libs/ReportUtils';
import {getSections, getSortedSections} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';
import useActionLoadingReportIDs from './useActionLoadingReportIDs';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

/**
 * Returns sorted keys of reports pending deletion.
 * Sorted string[] keeps Onyx comparison cheap (PERF-11).
 */
const selectPendingDeleteReportKeys = (reports: OnyxCollection<Report>): string[] => {
    const keys: string[] = [];
    for (const [key, report] of Object.entries(reports ?? {})) {
        if (isReportPendingDelete(report)) {
            keys.push(key);
        }
    }
    return keys.sort();
};

type UseSearchSectionsResult = {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

function useSearchSections(): UseSearchSectionsResult {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);
    const [pendingDeleteReportKeys = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: selectPendingDeleteReportKeys});
    const pendingDeleteReportKeysSet = new Set(pendingDeleteReportKeys);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {localeCompare, formatPhoneNumber, translate} = useLocalize();
    const isActionLoadingSet = useActionLoadingReportIDs();

    const [exportReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: selectFilteredReportActions,
    });

    const [cardFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allReportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);

    const archivedReportsIdSet = useArchivedReportsIdSet();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const {type, status, sortBy, sortOrder, groupBy} = lastSearchQuery?.queryJSON ?? {};
    const searchResultsData = currentSearchResults?.data;
    const searchResultsSearch = currentSearchResults?.search;
    const currentAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const searchKey = lastSearchQuery?.searchKey;

    let results: Array<string | undefined> = [];
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
            conciergeReportID,
        });
        results = getSortedSections(type, status ?? '', searchData, localeCompare, translate, sortBy, sortOrder, groupBy).map((value) => value.reportID);
    }

    const allReports = results.filter((id) => {
        if (!id) {
            return false;
        }
        return !pendingDeleteReportKeysSet.has(`${ONYXKEYS.COLLECTION.REPORT}${id}`);
    });

    return {allReports, isSearchLoading: !!currentSearchResults?.search?.isLoading, lastSearchQuery};
}

export {selectPendingDeleteReportKeys};
export default useSearchSections;
