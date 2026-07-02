import {useEffect, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {wasMessageReceivedWhileOffline} from '@libs/ReportActionsUtils';
import Visibility from '@libs/Visibility';
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
    /** The report whose unread marker is being computed */
    reportID: string;

    /** The visible actions (FlatList `data` domain, newest-first) that the marker scan runs over */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** All sorted actions (the full chain); used to find the earliest-received-while-offline message index */
    sortedReportActions: OnyxTypes.ReportAction[];

    /** The oldest unread action id used as the pagination anchor for marker placement before actions have fully loaded */
    oldestUnreadReportActionID: string | undefined;

    /** Whether the list is scrolled past the threshold where incoming actions are treated as out of view */
    isScrolledOverThreshold: boolean;

    /** Whether report actions have loaded at least once; once true, the pagination anchor is ignored in favor of the scan */
    hasOnceLoadedReportActions: boolean;
};

type UseUnreadMarkerResult = {
    /** The reportActionID the unread marker should render above, or `null` if none qualifies */
    unreadMarkerReportActionID: string | null;

    /** Index of that action within `sortedVisibleReportActions`, or `-1` if none */
    unreadMarkerReportActionIndex: number;
};

const lastReadTimeSelector = (report: OnyxTypes.Report | undefined) => report?.lastReadTime ?? '';

function useUnreadMarker({
    reportID,
    sortedVisibleReportActions,
    sortedReportActions,
    oldestUnreadReportActionID,
    isScrolledOverThreshold,
    hasOnceLoadedReportActions,
}: UseUnreadMarkerParams): UseUnreadMarkerResult {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const {getLocalDateFromDatetime} = useLocalize();
    const {isOffline, lastOfflineAt, lastOnlineAt} = useNetworkWithOfflineStatus();

    const [reportLastReadTimeValue] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        selector: lastReadTimeSelector,
    });
    const reportLastReadTime = reportLastReadTimeValue ?? '';

    const [unreadMarkerTime, setUnreadMarkerTime] = useState(reportLastReadTime);

    const [trackedReportID, setTrackedReportID] = useState(reportID);
    if (trackedReportID !== reportID) {
        setTrackedReportID(reportID);
        setUnreadMarkerTime(reportLastReadTime);
    }

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
    const [prevUnreadMarkerReportActionID, setPrevUnreadMarkerReportActionID] = useState<string | null>(null);

    let earliestReceivedOfflineMessageIndex: number | undefined;
    for (let i = sortedReportActions.length - 1; i >= 0; i--) {
        const message = sortedReportActions.at(i);
        if (message && wasMessageReceivedWhileOffline(message, isOffline, lastOfflineAt.current, lastOnlineAt.current, getLocalDateFromDatetime)) {
            earliestReceivedOfflineMessageIndex = i;
            break;
        }
    }

    // Index must be in the same domain as FlatList `data` (sortedVisibleReportActions), not the paginated full chain.
    let oldestUnreadReportActionMarker: [string, number] | undefined;
    if (oldestUnreadReportActionID && !hasOnceLoadedReportActions) {
        const visibleIndex = sortedVisibleReportActions.findIndex((action) => action.reportActionID === oldestUnreadReportActionID);
        if (visibleIndex >= 0) {
            oldestUnreadReportActionMarker = [oldestUnreadReportActionID, visibleIndex];
        }
    }

    const scanned = getUnreadMarkerReportAction({
        visibleReportActions: sortedVisibleReportActions,
        earliestReceivedOfflineMessageIndex,
        currentUserAccountID,
        prevSortedVisibleReportActionsObjects,
        unreadMarkerTime,
        isScrolledOverThreshold,
        isOffline,
        isReversed: false,
        isAnonymousUser,
        prevUnreadMarkerReportActionID,
        hasWindowFocus: Visibility.hasFocus(),
    });
    // Pagination is anchored to the oldest unread on first open; that anchor does not change when the user
    // marks read or unread, or when messages are deleted. Prefer the scan when it does not match that stale id.
    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex]: [string | null, number] =
        oldestUnreadReportActionMarker && (scanned[0] === null || scanned[0] === oldestUnreadReportActionMarker[0]) ? oldestUnreadReportActionMarker : scanned;

    if (prevUnreadMarkerReportActionID !== unreadMarkerReportActionID) {
        setPrevUnreadMarkerReportActionID(unreadMarkerReportActionID);
    }

    // When the user reads a new message as it is received, push unreadMarkerTime down to the
    // latest action's timestamp so new incoming actions display over those new messages instead of
    // sticking to the initial lastReadTime.
    const mostRecentReportActionCreated = sortedVisibleReportActions.at(0)?.created ?? '';
    if (!isAnonymousUser && !unreadMarkerReportActionID && mostRecentReportActionCreated > unreadMarkerTime) {
        setUnreadMarkerTime(mostRecentReportActionCreated);
    }

    return {
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
    };
}

export default useUnreadMarker;
