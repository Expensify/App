import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import AppStateMonitor from '@libs/AppStateMonitor';
import {Scheduler} from '@libs/Scheduler';
import UnreadIndicatorUtils from '@libs/UnreadIndicatorUpdater';
import updateUnread, {setUnreadUpdateCallback} from '@libs/UnreadIndicatorUpdater/updateUnread';

import ONYXKEYS from '@src/ONYXKEYS';
import {hasDraftCommentSelector} from '@src/selectors/Report';
import {emailAndAccountIDSelector} from '@src/selectors/Session';

import {useEffect, useState} from 'react';

/** Keeps the tab title and app badge unread count in sync. Renders nothing. */
function UnreadIndicatorUpdater() {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [reportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const reportAttributes = useReportAttributes();
    const [currentUser] = useOnyx(ONYXKEYS.SESSION, {
        selector: emailAndAccountIDSelector,
    });
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {currentReportID} = useCurrentReportIDState();
    // The scan only checks whether a draft exists, so typing within one draft must not rerun it
    const [hasDraftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${currentReportID}`, {selector: hasDraftCommentSelector});
    const [unreadReportIDs, setUnreadReportIDs] = useState<string[]>();

    // The scan covers every report, so it waits until React is idle instead of running inside the renders of a send.
    // A change cancels the scan that is still waiting, so changes that arrive before React is idle share one scan.
    useEffect(() => {
        const task = Scheduler.scheduleWhenIdle(() => {
            setUnreadReportIDs(
                UnreadIndicatorUtils.getUnreadReportIDsForUnreadIndicator(reports, currentReportID, hasDraftComment, {
                    reportNameValuePairs,
                    reportActions,
                    reportAttributes,
                    currentUserLogin: currentUser?.email,
                    currentUserAccountID: currentUser?.accountID,
                    conciergeReportID,
                }),
            );
        });
        return () => task.cancel();
    }, [reports, currentReportID, hasDraftComment, reportNameValuePairs, reportActions, reportAttributes, currentUser?.email, currentUser?.accountID, conciergeReportID]);

    useEffect(() => {
        // Nothing is published before the first scan, so the badge and title keep their value instead of dropping to zero while it waits
        if (!unreadReportIDs) {
            return;
        }
        const publish = () => updateUnread(unreadReportIDs.length, unreadReportIDs);
        publish();
        setUnreadUpdateCallback(publish);
        const unsubscribe = AppStateMonitor.addBecameActiveListener(publish);
        return unsubscribe;
    }, [unreadReportIDs]);

    return null;
}

export default UnreadIndicatorUpdater;
