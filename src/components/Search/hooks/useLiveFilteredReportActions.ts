import {selectFilteredReportActions, selectFilteredReportActionsForReports} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {useCallback, useMemo} from 'react';
// Use the original useOnyx hook to get the real-time data from Onyx and not from the snapshot
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

/**
 * Live submit/approve/export report actions for Search views. The wrapped useOnyx reads REPORT_ACTIONS from the
 * search snapshot, which never holds optimistic actions. Pass reportIDs to scope the selector to the reports a
 * group renders, so the selected output and its equality check stay small.
 */
function useLiveFilteredReportActions(reportIDs?: string[]): Record<string, ReportAction[]> | undefined {
    const reportActionsKeys = useMemo(() => [...new Set(reportIDs)].map((reportID) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`), [reportIDs]);
    const selector = useCallback(
        (reportActions: Parameters<typeof selectFilteredReportActions>[0]) =>
            reportIDs ? selectFilteredReportActionsForReports(reportActions, reportActionsKeys) : selectFilteredReportActions(reportActions),
        [reportIDs, reportActionsKeys],
    );
    const [liveReportActions] = useOnyxWithoutSnapshots<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS, Record<string, ReportAction[]> | undefined>(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector,
    });
    return liveReportActions;
}

export default useLiveFilteredReportActions;
