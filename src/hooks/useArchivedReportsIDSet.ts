import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {isArchivedReport, isReportArchivedByID} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

/**
 * Selector that extracts archived report IDs as a sorted array.
 * Onyx performs shallow comparison on the returned array to prevent
 * unnecessary re-renders without expensive deep comparison of Sets.
 */
const archivedReportIDsSelector = (reportNameValuePairs: OnyxCollection<ReportNameValuePairs>): string[] => {
    if (!reportNameValuePairs) {
        return [];
    }

    const ids: string[] = [];
    for (const [key, value] of Object.entries(reportNameValuePairs)) {
        if (isArchivedReport(value)) {
            ids.push(key);
        }
    }
    return ids;
};

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIDSet(): ArchivedReportsIDSet {
    const [archivedReportIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {selector: archivedReportIDsSelector});

    return useMemo(() => new Set(archivedReportIDs), [archivedReportIDs]);
}

function useIsReportArchivedByID() {
    const archivedReportsIDSet = useArchivedReportsIDSet();

    return useCallback((reportID?: string) => isReportArchivedByID(archivedReportsIDSet, reportID), [archivedReportsIDSet]);
}

export default useArchivedReportsIDSet;
export {useIsReportArchivedByID};
