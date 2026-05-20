import type {RefObject} from 'react';
import {useEffect, useEffectEvent, useLayoutEffect, useRef, useState} from 'react';
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

    const prevUnreadMarkerReportActionID = useRef<string | null>(null);
    const [unreadMarkerTime, setUnreadMarkerTime] = useState(reportLastReadTime);
    const [markerState, setMarkerState] = useState<[string | null, number]>([null, -1]);

    // Reset the marker time when switching between reports — same instance is reused per report.
    useEffect(() => {
        setUnreadMarkerTime(reportLastReadTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    // When lastReadTime transitions from empty to a real value (e.g., data hasn't
    // loaded yet after sign-in), update the marker so it uses the fresh value
    // instead of the empty string from initial mount.
    useEffect(() => {
        if (reportLastReadTime === '' || unreadMarkerTime !== '') {
            return;
        }
        setUnreadMarkerTime(reportLastReadTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportLastReadTime]);

    /**
     * Subscribe to read/unread events and update our unreadMarkerTime.
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

    // Reading refs at render-time would bail the compiler. Wrap the marker computation in an
    // effect-event so the latest ref values are read at commit time, and store the result in state.
    const computeMarker = useEffectEvent(() => {
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
        if (oldestUnreadReportAction && !hasOnceLoadedReportActions) {
            const visibleIndex = sortedVisibleReportActions.findIndex((action) => action.reportActionID === oldestUnreadReportAction.reportActionID);
            if (visibleIndex >= 0) {
                oldestUnreadReportActionMarker = [oldestUnreadReportAction.reportActionID, visibleIndex];
            }
        }

        const scanned = getUnreadMarkerReportAction({
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

        let next: [string | null, number];
        if (oldestUnreadReportActionMarker) {
            const [oldestAnchorActionID] = oldestUnreadReportActionMarker;
            // Pagination is anchored to the oldest unread on first open; that anchor does not change when the user
            // marks read or unread, or when messages are deleted. Prefer the scan when it does not match that stale id.
            if (scanned[0] !== null && scanned[0] !== oldestAnchorActionID) {
                next = scanned;
            } else {
                next = oldestUnreadReportActionMarker;
            }
        } else {
            next = scanned;
        }

        prevUnreadMarkerReportActionID.current = next[0];
        setMarkerState((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next));
    });

    useLayoutEffect(() => {
        computeMarker();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedVisibleReportActions, sortedReportActions, oldestUnreadReportAction, hasOnceLoadedReportActions, isOffline, unreadMarkerTime, currentUserAccountID, isAnonymousUser]);

    const [unreadMarkerReportActionID, unreadMarkerReportActionIndex] = markerState;

    // When the user reads a new message as it is received, push unreadMarkerTime down to the
    // latest action's timestamp so new incoming actions display over those new messages instead of
    // sticking to the initial lastReadTime. Adjusting state during render (vs. a layout effect) is
    // the React-recommended pattern — avoids cascading commits.
    // https://react.dev/reference/react/useState#storing-information-from-previous-renders
    const lastAction = sortedVisibleReportActions.at(0);
    const mostRecentReportActionCreated = lastAction?.created ?? '';
    if (!isAnonymousUser && !unreadMarkerReportActionID && mostRecentReportActionCreated > unreadMarkerTime) {
        setUnreadMarkerTime(mostRecentReportActionCreated);
    }

    return {
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
    };
}

export default useUnreadMarker;
export type {UseUnreadMarkerParams, UseUnreadMarkerResult};
