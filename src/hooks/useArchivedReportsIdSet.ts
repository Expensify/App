import type {OnyxCollection} from 'react-native-onyx';
import {isArchivedReport} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';
import useDeepCompareRef from './useDeepCompareRef';
import useOnyx from './useOnyx';

/**
 * Function that creates a Set of archived report IDs from report name value pairs
 */
const getArchivedReportsIdSet = (reportNameValuePairs: OnyxCollection<ReportNameValuePairs>): ArchivedReportsIDSet | undefined => {
    if (!reportNameValuePairs) {
        return undefined;
    }
    const ids = new Set<string>();

    for (const [key, value] of Object.entries(reportNameValuePairs)) {
        if (isArchivedReport(value)) {
            ids.add(key);
        }
    }
    return ids;
};

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIdSet(): ArchivedReportsIDSet {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
    });
    const archivedReportsIdSet = getArchivedReportsIdSet(reportNameValuePairs) ?? CONST.EMPTY_SET;

    // useDeepCompareRef is used here to prevent unnecessary re-renders by maintaining referential equality
    // when the Set contents are the same, even if it's a new Set instance. This is important for performance
    // optimization since Sets are reference types and would normally cause re-renders even with same values
    // Reassure test confirmed additional rerender when not using useDeepCompareRef
    return useDeepCompareRef(archivedReportsIdSet) ?? new Set<string>();
}

export default useArchivedReportsIdSet;
