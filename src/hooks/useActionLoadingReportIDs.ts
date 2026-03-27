import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportMetadata} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Selector that extracts report keys with isActionLoading=true as a sorted array.
 * Onyx performs shallow comparison on the returned array to prevent
 * unnecessary re-renders without expensive deep comparison of Sets.
 */
const actionLoadingReportIDsSelector = (reportMetadata: OnyxCollection<ReportMetadata>): string[] => {
    if (!reportMetadata) {
        return [];
    }
    const ids: string[] = [];
    for (const [key, value] of Object.entries(reportMetadata)) {
        if (value?.isActionLoading) {
            ids.push(key);
        }
    }
    return ids;
};

/**
 * Hook that returns a Set of report metadata keys where isActionLoading is true.
 * The Set is memoized based on the selector's stable array reference
 * to avoid creating a new Set on every render.
 */
function useActionLoadingReportIDs(): ReadonlySet<string> {
    const [actionLoadingReportIDs = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {selector: actionLoadingReportIDsSelector});

    return useMemo(() => new Set(actionLoadingReportIDs), [actionLoadingReportIDs]);
}

export default useActionLoadingReportIDs;
