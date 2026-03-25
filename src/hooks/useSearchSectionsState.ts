import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type LastSearchParams from '@src/types/onyx/ReportNavigation';
import useOnyx from './useOnyx';

type UseSearchSectionsStateResult = {
    allReports: Array<string | undefined>;
    isSearchLoading: boolean;
    lastSearchQuery: OnyxEntry<LastSearchParams>;
};

/**
 * Reads pre-sorted report IDs from a dedicated Onyx key persisted by useSearchSections,
 * so MoneyRequestReportNavigation can determine prev/next report without any computation.
 * The IDs live in a separate key so that saveLastSearchParams (Onyx.set) cannot wipe them.
 */
function useSearchSectionsState(): UseSearchSectionsStateResult {
    const [lastSearchQuery] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY);
    const [sortedReportIDs] = useOnyx(ONYXKEYS.REPORT_NAVIGATION_SORTED_REPORT_IDS);
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${lastSearchQuery?.queryJSON?.hash}`);

    return {
        allReports: sortedReportIDs ?? [],
        isSearchLoading: !!currentSearchResults?.search?.isLoading,
        lastSearchQuery,
    };
}

export default useSearchSectionsState;
