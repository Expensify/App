import type {RefObject} from 'react';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {wasMessageReceivedWhileOffline} from '@libs/ReportActionsUtils';
import {getUnreadMarkerReportAction} from '@pages/inbox/report/shouldDisplayNewMarkerOnReportAction';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsAnonymousUser from './useIsAnonymousUser';
import useLocalize from './useLocalize';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

type UseUnreadMarkerParams = {
    /** The report ID */
    reportID: string;

    /** Sorted actions that should be visible to the user */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** All sorted report actions (including hidden) — used for offline message index calculation */
    sortedReportActions: OnyxTypes.ReportAction[];

    /** Ref to the current vertical scroll offset */
    scrollingVerticalOffset: RefObject<number>;
};

type UseUnreadMarkerResult = {
    /** The reportActionID that should display the unread marker above it */
    unreadMarkerReportActionID: string | null;

    /** The index within sortedVisibleReportActions of the action with the unread marker */
    unreadMarkerReportActionIndex: number;
};

const lastReadTimeSelector = (report: OnyxTypes.Report | undefined) => report?.lastReadTime ?? '';

function useUnreadMarker({reportID, sortedVisibleReportActions, sortedReportActions, scrollingVerticalOffset}: UseUnreadMarkerParams): UseUnreadMarkerResult {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const {getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();

    const [reportLastReadTime] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        selector: lastReadTimeSelector,
    });

    const lastReadTime = reportLastReadTime ?? '';

    const [unreadMarkerTime, setUnreadMarkerTime] = useState(lastReadTime);

    // When reportID changes (handled by key={reportID} at the list level), reset unreadMarkerTime
    // to the current lastReadTime for the new report.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setUnreadMarkerTime(lastReadTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    /**
     * Subscribe to read/unread events and update unreadMarkerTime.
     */
    useEffect(() => {
        if (isAnonymousUser) {
            return;
        }

        const unreadActionSubscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, (newLastReadTime: string) => {
            setUnreadMarkerTime(newLastReadTime);
        });
        const readNewestActionSubscription = DeviceEventEmitter.addListener(`readNewestAction_${reportID}`, (newLastReadTime: string) => {
            setUnreadMarkerTime(newLastReadTime);
        });

        return () => {
            unreadActionSubscription.remove();
            readNewestActionSubscription.remove();
        };
    }, [reportID, isAnonymousUser]);

    const sortedVisibleReportActionsObjects: OnyxTypes.ReportActions = sortedVisibleReportActions.reduce<OnyxTypes.ReportActions>((actions, action) => {
        // eslint-disable-next-line no-param-reassign
        actions[action.reportActionID] = action;
        return actions;
    }, {});

    const prevSortedVisibleReportActionsObjects = usePrevious(sortedVisibleReportActionsObjects);

    const lastAction = sortedVisibleReportActions.at(0);

    const prevUnreadMarkerReportActionID = useRef<string | null>(null);

    /**
     * The index of the earliest message that was received while offline.
     * Reverse for-loop using .at() to find the last qualifying index.
     */
    let earliestReceivedOfflineMessageIndex: number | undefined;
    for (let i = sortedReportActions.length - 1; i >= 0; i--) {
        const message = sortedReportActions.at(i);
        if (message && wasMessageReceivedWhileOffline(message, isOffline, lastOfflineAt.current, lastOnlineAt.current, getLocalDateFromDatetime)) {
            earliestReceivedOfflineMessageIndex = i;
            break;
        }
    }

    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = getUnreadMarkerReportAction({
        visibleReportActions: sortedVisibleReportActions,
        earliestReceivedOfflineMessageIndex,
        currentUserAccountID,
        prevSortedVisibleReportActionsObjects,
        unreadMarkerTime,
        scrollingVerticalOffset: scrollingVerticalOffset.current ?? 0,
        prevUnreadMarkerReportActionID: prevUnreadMarkerReportActionID.current,
        isOffline,
        isReversed: false,
        isAnonymousUser,
    });
    prevUnreadMarkerReportActionID.current = unreadMarkerReportActionID;

    /**
     * When the user reads a new message as it is received, push unreadMarkerTime down to the
     * latest action's timestamp. When new actions arrive while the user is scrolled away
     * (above MSG_VISIBLE_THRESHOLD), the marker displays over those new messages instead of
     * sticking to the initial lastReadTime.
     */
    useLayoutEffect(() => {
        if (isAnonymousUser || unreadMarkerReportActionID) {
            return;
        }

        const mostRecentReportActionCreated = lastAction?.created ?? '';
        if (mostRecentReportActionCreated <= unreadMarkerTime) {
            return;
        }

        setUnreadMarkerTime(mostRecentReportActionCreated);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastAction?.created]);

    return {
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
    };
}

export default useUnreadMarker;
export type {UseUnreadMarkerParams, UseUnreadMarkerResult};
