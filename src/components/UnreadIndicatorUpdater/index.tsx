import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';

import AppStateMonitor from '@libs/AppStateMonitor';
import UnreadIndicatorUtils from '@libs/UnreadIndicatorUpdater';
import updateUnread, {setUnreadUpdateCallback} from '@libs/UnreadIndicatorUpdater/updateUnread';

import ONYXKEYS from '@src/ONYXKEYS';

import {useDeferredValue, useEffect} from 'react';

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

    // The count only feeds an effect, so the scan over all reports runs in a deferred low priority render and
    // doesn't compete with the render that shows a just-sent message. React Compiler caches the scan on its inputs.
    const deferredReports = useDeferredValue(reports);
    const deferredReportNameValuePairs = useDeferredValue(reportNameValuePairs);
    const deferredReportActions = useDeferredValue(reportActions);
    const deferredReportAttributes = useDeferredValue(reportAttributes);
    const deferredCurrentReportID = useDeferredValue(currentReportID);
    const deferredDraftComment = useDeferredValue(draftComment);
    const unreadReportIDs = UnreadIndicatorUtils.getUnreadReportIDsForUnreadIndicator(deferredReports, deferredCurrentReportID, deferredDraftComment, {
        reportNameValuePairs: deferredReportNameValuePairs,
        reportActions: deferredReportActions,
        reportAttributes: deferredReportAttributes,
        currentUserLogin: session?.email,
        currentUserAccountID: session?.accountID,
        conciergeReportID,
    });

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
