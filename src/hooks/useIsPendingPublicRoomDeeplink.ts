import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * FIX #82013: Returns whether `reportID` is the public room currently being opened from a signed-out deeplink,
 * tracked via the RAM-only pending-deeplink key. Several guards (ReportNavigateAwayHandler, ReportNotFoundGuard)
 * must not interfere with that room while it is settling; centralizing the match here keeps the rule in one place
 * so a future change (e.g. ID normalization) can't be applied to some guards and missed in others.
 */
function useIsPendingPublicRoomDeeplink(reportID: string | undefined): boolean {
    const [pendingPublicRoomReportID] = useOnyx(ONYXKEYS.RAM_ONLY_PENDING_PUBLIC_ROOM_DEEPLINK_REPORT_ID);
    return !!pendingPublicRoomReportID && !!reportID && reportID === pendingPublicRoomReportID;
}

export default useIsPendingPublicRoomDeeplink;
