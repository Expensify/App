import {useIsFocused, useRoute} from '@react-navigation/native';
import type {RefObject} from 'react';
import {useEffect, useEffectEvent, useRef, useSyncExternalStore} from 'react';
import {DeviceEventEmitter} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isCurrentActionUnread, isReportPreviewAction} from '@libs/ReportActionsUtils';
import {isArchivedNonExpenseReport, isUnread} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

// useRef gets reset when the reportID changes (the list reuses the same instance per report),
// so we use a module-level variable to track the previous report across re-instantiations.
let prevReportID: string | null = null;

type UseMarkAsReadParams = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    scrollingVerticalOffset: RefObject<number>;
    hasNewerActions: boolean;
};

type UseMarkAsReadResult = {
    readActionSkippedRef: RefObject<boolean>;
};

function useMarkAsRead({reportID, report, transactionThreadReport, sortedVisibleReportActions, scrollingVerticalOffset, hasNewerActions}: UseMarkAsReadParams): UseMarkAsReadResult {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isFocused = useIsFocused();
    const isReportArchived = useReportIsArchived(reportID);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);

    const isVisible = useSyncExternalStore(Visibility.onVisibilityChange, Visibility.isVisible);

    const readActionSkippedRef = useRef(false);
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const didMarkReportAsReadInitially = useRef(false);

    const lastAction = sortedVisibleReportActions.at(0);
    const isReportUnreadValue = isUnread(report, transactionThreadReport, isReportArchived) || (!!lastAction && isCurrentActionUnread(report, lastAction));

    // Refresh userActiveSince + reset initial-mount gate when the same component instance is reused for another report.
    useEffect(() => {
        userActiveSince.current = DateUtils.getDBTime();
        didMarkReportAsReadInitially.current = false;
        prevReportID = reportID;
    }, [reportID]);

    // The unread-marker hook also subscribes to `unreadAction_${reportID}` to update the marker
    // time. We subscribe separately so this hook owns the userActiveSince concern.
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, () => {
            userActiveSince.current = DateUtils.getDBTime();
        });
        return () => subscription.remove();
    }, [reportID]);

    // Mark the report as read when the user initially opens the report and there are unread messages.
    useEffect(() => {
        if (!isReportUnreadValue || didMarkReportAsReadInitially.current) {
            didMarkReportAsReadInitially.current = true;
            return;
        }

        didMarkReportAsReadInitially.current = true;
        readNewestAction(reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
    }, [isReportUnreadValue, reportID, reportLoadingState?.hasOnceLoadedReportActions]);

    const handleReportChangeMarkAsRead = useEffectEvent(() => {
        if (reportID !== prevReportID) {
            return false;
        }

        const isLastActionUnread = !!lastAction && isCurrentActionUnread(report, lastAction, sortedVisibleReportActions);
        if (!isUnread(report, transactionThreadReport, isReportArchived) && !isLastActionUnread) {
            return false;
        }
        // On desktop, when the notification center is displayed, isVisible will return false.
        // Currently, there's no programmatic way to dismiss the notification center panel.
        // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
        const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
        const isScrolledToEnd = scrollingVerticalOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;

        if ((isVisible || isFromNotification) && !hasNewerActions && isScrolledToEnd) {
            readNewestAction(reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
            if (isFromNotification) {
                Navigation.setParams({referrer: undefined});
            }
            return true;
        }

        readActionSkippedRef.current = true;
        return false;
    });

    // This `mark as read` will only run when the focused report has new messages and the App visibility
    // changes to visible (user switched to the app/web while previously on another tab/application).
    // We mark the report as read so the LHN report item is marked read while the unread marker still
    // shows the messages received while the user wasn't focused on the report.
    const handleAppVisibilityMarkAsRead = useEffectEvent(() => {
        if (reportID !== prevReportID) {
            return;
        }

        if (!isVisible || !isFocused) {
            if (!lastMessageTime.current) {
                lastMessageTime.current = lastAction?.created ?? '';
            }
            return;
        }

        // If the user read new messages (after being inactive) on another device, show the marker based on report.lastReadTime.
        const newMessageTimeReference = lastMessageTime.current && report?.lastReadTime && lastMessageTime.current > report.lastReadTime ? userActiveSince.current : report?.lastReadTime;
        lastMessageTime.current = null;

        const isArchivedReport = isArchivedNonExpenseReport(report, isReportArchived);
        const hasNewMessagesInView = scrollingVerticalOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
        const hasUnreadReportAction = sortedVisibleReportActions.some(
            (reportAction) =>
                newMessageTimeReference &&
                newMessageTimeReference < reportAction.created &&
                (isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== currentUserAccountID,
        );

        if (!isArchivedReport && (!hasNewMessagesInView || !hasUnreadReportAction)) {
            return;
        }

        readNewestAction(reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
        userActiveSince.current = DateUtils.getDBTime();
    });

    useEffect(() => {
        // handleReportChangeMarkAsRead short-circuits via its return value to prevent duplicate readNewestAction calls.
        const isMarkedAsRead = handleReportChangeMarkAsRead();
        if (!isMarkedAsRead) {
            handleAppVisibilityMarkAsRead();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, reportID, isVisible, isFocused, reportLoadingState?.hasOnceLoadedReportActions]);

    return {readActionSkippedRef};
}

export default useMarkAsRead;
export type {UseMarkAsReadParams, UseMarkAsReadResult};
