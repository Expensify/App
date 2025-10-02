import {useCallback, useEffect, useMemo, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import {resetOldestUnreadReportActionID} from '@libs/actions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type UseOldestUnreadReportActionIDProps = {
    reportID: string | undefined;
};

function useOldestUnreadReportActionID({reportID}: UseOldestUnreadReportActionIDProps) {
    const [oldestUnreadReportActionIDValueFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_OLDEST_UNREAD_REPORT_ACTION_ID}${reportID}`, {canBeMissing: true});
    const [oldestUnreadReportActionIDState, setOldestUnreadReportActionIDState] = useState<string | undefined>(oldestUnreadReportActionIDValueFromOnyx);
    const oldestUnreadReportActionID = useMemo(
        () => (oldestUnreadReportActionIDState === CONST.NOT_FOUND_ID ? undefined : oldestUnreadReportActionIDState),
        [oldestUnreadReportActionIDState],
    );

    // When we open a report, we have to wait for the oldest unread report action ID to be set and
    // retrieved from Onyx, in order to get the correct initial report action page from store.
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

    return {oldestUnreadReportActionID, isLoading, reset};
}

export default useOldestUnreadReportActionID;
