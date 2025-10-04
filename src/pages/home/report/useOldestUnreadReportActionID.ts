import {useCallback, useEffect, useMemo, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {resetOldestUnreadReportActionID} from '@libs/actions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type UseOldestUnreadReportActionIDProps = {
    reportID: string | undefined;
};

/**
 * This hook is used to get the oldest unread report action ID for a given report. When a report is opened,
 * we first have to fetch the value from Onyx, after which it will get reset, so that it's not used again.
 * This hook also provides a reset function and a loading state.
 * @param reportID - The ID of the report to get the oldest unread report action ID for.
 * @returns The oldest unread report action ID for the given report.
 */
function useOldestUnreadReportActionID({reportID}: UseOldestUnreadReportActionIDProps) {
    const [oldestUnreadReportActionIDValueFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_OLDEST_UNREAD_REPORT_ACTION_ID}${reportID}`, {canBeMissing: true});
    const [oldestUnreadReportActionIDState, setOldestUnreadReportActionIDState] = useState<string | undefined>(oldestUnreadReportActionIDValueFromOnyx);
    const oldestUnreadReportActionID = useMemo(
        () => (oldestUnreadReportActionIDState === CONST.NOT_FOUND_ID ? undefined : oldestUnreadReportActionIDState),
        [oldestUnreadReportActionIDState],
    );

    // Whether the oldest unread report action ID is still loading from Onyx.
    const isLoading = useMemo(() => !oldestUnreadReportActionIDState, [oldestUnreadReportActionIDState]);

    const reset = useCallback(() => {
        setOldestUnreadReportActionIDState(undefined);
    }, []);

    // Set the oldestUnreadReportActionID in state once loaded from Onyx, and clear Onyx state to prevent stale data.
    useEffect(() => {
        if (!oldestUnreadReportActionIDValueFromOnyx || (oldestUnreadReportActionIDValueFromOnyx && !!oldestUnreadReportActionIDState)) {
            return;
        }

        if (oldestUnreadReportActionIDValueFromOnyx !== oldestUnreadReportActionIDState) {
            setOldestUnreadReportActionIDState(oldestUnreadReportActionIDValueFromOnyx);
        }

        resetOldestUnreadReportActionID(reportID);
    }, [oldestUnreadReportActionIDState, oldestUnreadReportActionIDValueFromOnyx, reportID]);

    return {
        oldestUnreadReportActionID,
        isLoading,
        reset,
    };
}

export default useOldestUnreadReportActionID;
