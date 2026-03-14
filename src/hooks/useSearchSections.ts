import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isReportPendingDelete, selectFilteredReportActions} from '@libs/ReportUtils';
import {getSections, getSortedSections} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useActionLoadingReportIDs from './useActionLoadingReportIDs';
import useArchivedReportsIdSet from './useArchivedReportsIdSet';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

type ReportPendingFields = Pick<Report, 'pendingAction' | 'pendingFields'>;

const selectReportsPendingFields = (reports: OnyxCollection<Report>) =>
    mapOnyxCollectionItems(reports, (report): ReportPendingFields | undefined =>
        report
            ? {
                  pendingAction: report.pendingAction,
                  pendingFields: report.pendingFields,
              }
            : undefined,
    );

type UseSearchSectionsResult = {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

function useSearchSections(): UseSearchSectionsResult {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);
    const [liveReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: selectReportsPendingFields});
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
            cardList,
        });
        results = getSortedSections(type, status ?? '', searchData, localeCompare, translate, sortBy, sortOrder, groupBy).map((value) => value.reportID);
    }

    const allReports = results.filter((id) => {
        if (!id) {
            return false;
        }
        const liveReport = liveReports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`];
        return !isReportPendingDelete(liveReport);
    });

    return {allReports, isSearchLoading: !!currentSearchResults?.search?.isLoading, lastSearchQuery};
}

export default useSearchSections;
