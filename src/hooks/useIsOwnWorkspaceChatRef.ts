import {useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

/**
 * Returns a ref that tracks whether the currently-open report is an own workspace chat.
 *
 * Must be updated synchronously during render — after a vacation delegate splits an expense
 * the server sends an Onyx SET that wipes the report object. By the time any useEffect fires,
 * `report` is already undefined, so live state and usePrevious both fail. The ref persists
 * the last known value through that wipe window so navigation guards and re-fetch effects
 * can still make the correct decision. See issue #84248.
 */
function useIsOwnWorkspaceChatRef(report: OnyxEntry<OnyxTypes.Report> | undefined, reportIDFromRoute: string | undefined) {
    const isOwnWorkspaceChatRef = useRef(false);

    if (report?.reportID && report.reportID === reportIDFromRoute) {
        // Valid, matching report — update the ref.
        isOwnWorkspaceChatRef.current = !!report.isOwnPolicyExpenseChat;
    } else if (!report?.reportID) {
        // Report wiped by Onyx SET — intentionally keep the last known value.
    } else {
        // Different report loaded — reset.
        isOwnWorkspaceChatRef.current = false;
    }

    return isOwnWorkspaceChatRef;
}

export default useIsOwnWorkspaceChatRef;
