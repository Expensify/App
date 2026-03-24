import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';
import useOnyx from './useOnyx';

type UseSearchNavigationStateResult = {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

/**
 * Reads search navigation state from Onyx, including the pre-sorted report IDs
 * persisted by useSortedSearchResults in a separate key so that saveLastSearchParams
 * (Onyx.set) cannot inadvertently clear them.
 */
function useSearchNavigationState(): UseSearchNavigationStateResult {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [sortedReportIDs] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_SORTED_REPORT_IDS);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);

    return {
        allReports: sortedReportIDs ?? [],
        isSearchLoading: !!currentSearchResults?.search?.isLoading,
        lastSearchQuery,
    };
}

export default useSearchNavigationState;
