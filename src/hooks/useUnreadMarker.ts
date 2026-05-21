import type {RefObject} from 'react';
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
    reportID: string;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    sortedReportActions: OnyxTypes.ReportAction[];
    oldestUnreadReportAction: OnyxEntry<OnyxTypes.ReportAction>;
    scrollingVerticalOffset: RefObject<number>;
    hasOnceLoadedReportActions: boolean;
};

type UseUnreadMarkerResult = {
    unreadMarkerReportActionID: string | null;
    unreadMarkerReportActionIndex: number;
};

const lastReadTimeSelector = (report: OnyxTypes.Report | undefined) => report?.lastReadTime ?? '';

function useUnreadMarker({
    reportID,
    sortedVisibleReportActions,
    sortedReportActions,
    oldestUnreadReportAction,
    scrollingVerticalOffset,
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
    const prevUnreadMarkerReportActionIDRef = useRef<string | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnreadMarkerTime(reportLastReadTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    useEffect(() => {
        if (reportLastReadTime === '' || unreadMarkerTime !== '') {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUnreadMarkerTime(reportLastReadTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportLastReadTime]);

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

    const sortedVisibleReportActionsObjects: OnyxTypes.ReportActions = useMemo(
        () =>
            sortedVisibleReportActions.reduce<OnyxTypes.ReportActions>((actions, action) => {
                // eslint-disable-next-line no-param-reassign
                actions[action.reportActionID] = action;
                return actions;
            }, {}),
        [sortedVisibleReportActions],
    );
    const prevSortedVisibleReportActionsObjects = usePrevious(sortedVisibleReportActionsObjects);

    const earliestReceivedOfflineMessageIndex = useMemo(() => {
        for (let i = sortedReportActions.length - 1; i >= 0; i--) {
            const message = sortedReportActions.at(i);
            if (message && wasMessageReceivedWhileOffline(message, isOffline, lastOfflineAt.current, lastOnlineAt.current, getLocalDateFromDatetime)) {
                return i;
            }
        }
        return undefined;
    }, [getLocalDateFromDatetime, isOffline, lastOfflineAt, lastOnlineAt, sortedReportActions]);

    // Index must be in the same domain as FlatList `data` (sortedVisibleReportActions), not the paginated full chain.
    const oldestUnreadReportActionMarker = useMemo<[string, number] | undefined>(() => {
        if (!oldestUnreadReportAction || hasOnceLoadedReportActions) {
            return undefined;
        }
        const visibleIndex = sortedVisibleReportActions.findIndex((action) => action.reportActionID === oldestUnreadReportAction.reportActionID);
        if (visibleIndex < 0) {
            return undefined;
        }
        return [oldestUnreadReportAction.reportActionID, visibleIndex];
    }, [oldestUnreadReportAction, hasOnceLoadedReportActions, sortedVisibleReportActions]);

    const [markerState, setMarkerState] = useState<[string | null, number]>([null, -1]);

    useLayoutEffect(() => {
        const scanned = getUnreadMarkerReportAction({
            visibleReportActions: sortedVisibleReportActions,
            earliestReceivedOfflineMessageIndex,
            currentUserAccountID,
            prevSortedVisibleReportActionsObjects,
            unreadMarkerTime,
            scrollingVerticalOffset: scrollingVerticalOffset.current,
            prevUnreadMarkerReportActionID: prevUnreadMarkerReportActionIDRef.current,
            isOffline,
            isReversed: false,
            isAnonymousUser,
        });
        // Pagination is anchored to the oldest unread on first open; that anchor does not change when the user
        // marks read or unread, or when messages are deleted. Prefer the scan when it does not match that stale id.
        const next: [string | null, number] =
            oldestUnreadReportActionMarker && (scanned[0] === null || scanned[0] === oldestUnreadReportActionMarker[0]) ? oldestUnreadReportActionMarker : scanned;
        prevUnreadMarkerReportActionIDRef.current = next[0];
        setMarkerState((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next));
    }, [
        currentUserAccountID,
        earliestReceivedOfflineMessageIndex,
        isAnonymousUser,
        isOffline,
        oldestUnreadReportActionMarker,
        prevSortedVisibleReportActionsObjects,
        sortedVisibleReportActions,
        unreadMarkerTime,
        scrollingVerticalOffset,
    ]);

    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = markerState;

    // When the user reads a new message as it is received, push unreadMarkerTime down to the
    // latest action's timestamp so new incoming actions display over those new messages instead of
    // sticking to the initial lastReadTime.
    const lastAction = sortedVisibleReportActions.at(0);
    useLayoutEffect(() => {
        if (isAnonymousUser || unreadMarkerReportActionID) {
            return;
        }
        const mostRecentReportActionCreated = lastAction?.created ?? '';
        if (mostRecentReportActionCreated <= unreadMarkerTime) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
