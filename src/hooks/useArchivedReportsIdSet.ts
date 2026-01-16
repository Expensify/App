import {archivedReportsIdSetSelector} from '@selectors/ReportNameValuePairs';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useDeepCompareRef from './useDeepCompareRef';
import useOnyx from './useOnyx';

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIdSet(): ArchivedReportsIDSet {
    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: archivedReportsIdSetSelector,
    });

    // useDeepCompareRef is used here to prevent unnecessary re-renders by maintaining referential equality
    // when the Set contents are the same, even if it's a new Set instance. This is important for performance
    // optimization since Sets are reference types and would normally cause re-renders even with same values
    return useDeepCompareRef(archivedReportsIdSet) ?? new Set<string>();
}

export default useArchivedReportsIdSet;
