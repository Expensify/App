import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import AppStateMonitor from '@libs/AppStateMonitor';
import UnreadIndicatorUtils from '@libs/UnreadIndicatorUpdater';
import updateUnread, {setUnreadUpdateCallback} from '@libs/UnreadIndicatorUpdater/updateUnread';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

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
    const getUnreadReportIDsRef = useRef<ReturnType<typeof UnreadIndicatorUtils.createUnreadReportsTracker> | null>(null);
    const unreadReportIDsRef = useRef<string[]>([]);
    const publishedUnreadReportIDsRef = useRef<string | undefined>(undefined);

    // Sending or receiving a message changes several of these at once, so wait for them to settle before checking the changed reports
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!getUnreadReportIDsRef.current) {
                getUnreadReportIDsRef.current = UnreadIndicatorUtils.createUnreadReportsTracker();
            }
            const unreadReportIDs = getUnreadReportIDsRef.current(reports, currentReportID, draftComment, {
                reportNameValuePairs,
                reportActions,
                reportAttributes,
                currentUserLogin: session?.email,
                currentUserAccountID: session?.accountID,
                conciergeReportID,
            });
            unreadReportIDsRef.current = unreadReportIDs;

            const unreadReportIDsKey = unreadReportIDs.join(',');
            if (unreadReportIDsKey === publishedUnreadReportIDsRef.current) {
                return;
            }
            publishedUnreadReportIDsRef.current = unreadReportIDsKey;
            updateUnread(unreadReportIDs.length, unreadReportIDs);
        }, CONST.TIMING.UNREAD_UPDATE_DEBOUNCE_TIME);

        return () => clearTimeout(timeout);
    }, [reports, currentReportID, draftComment, reportNameValuePairs, reportActions, reportAttributes, session?.email, session?.accountID, conciergeReportID]);

    useEffect(() => {
        const publish = () => updateUnread(unreadReportIDsRef.current.length, unreadReportIDsRef.current);
        setUnreadUpdateCallback(publish);
        return AppStateMonitor.addBecameActiveListener(publish);
    }, []);

    return null;
}

export default UnreadIndicatorUpdater;
