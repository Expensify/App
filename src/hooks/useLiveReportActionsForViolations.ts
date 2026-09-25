import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

/**
 * Live (not snapshot) report actions: markPendingRTERTransactionsAsCash needs the IOU action's current
 * childReportID to resolve the transaction thread, which a stale search snapshot may not have yet.
 */
function useLiveReportActionsForViolations(reportID: string | undefined) {
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`);
    return useMemo(() => Object.values(reportActions ?? {}), [reportActions]);
}

export default useLiveReportActionsForViolations;
