import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import AppStateMonitor from '@libs/AppStateMonitor';
import UnreadIndicatorUtils from '@libs/UnreadIndicatorUpdater';
import updateUnread, {setUnreadUpdateCallback} from '@libs/UnreadIndicatorUpdater/updateUnread';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

/** Keeps the tab title and app badge unread count in sync. Renders nothing. */
function UnreadIndicatorUpdater() {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const reportAttributes = useReportAttributes();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {currentReportID} = useCurrentReportIDState();
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${currentReportID}`);

    // React Compiler caches this on its inputs, so it only reruns when one of them changes
    const unreadReports = UnreadIndicatorUtils.getUnreadReportsForUnreadIndicator(reports, currentReportID, draftComment, {
        reportNameValuePairs,
        reportActions,
        reportAttributes,
        currentUserLogin: session?.email,
        currentUserAccountID: session?.accountID,
        conciergeReportID,
    });
    const unreadReportIDs = unreadReports.map((report) => report?.reportID).filter((reportID): reportID is string => !!reportID);

    useEffect(() => {
        const publish = () => updateUnread(unreadReportIDs.length, unreadReportIDs);
        publish();
        setUnreadUpdateCallback(publish);
        const unsubscribe = AppStateMonitor.addBecameActiveListener(publish);
        return unsubscribe;
    }, [unreadReportIDs]);

    return null;
}

export default UnreadIndicatorUpdater;
