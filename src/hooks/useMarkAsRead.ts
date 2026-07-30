import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isCurrentActionUnread, isReportPreviewAction} from '@libs/ReportActionsUtils';
import {isArchivedNonExpenseReport, isUnread} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {readNewestAction} from '@userActions/Report';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsAnonymousUser from './useIsAnonymousUser';
import useIsReportActionsLoaded from './useIsReportActionsLoaded';
import useReportIsArchived from './useReportIsArchived';

// useRef gets reset when the reportID changes (the list reuses the same instance per report),
// so we use a module-level variable to track the previous report across re-instantiations.
let prevReportID: string | null = null;

type UseMarkAsReadParams = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    isScrolledToEnd: boolean;
    hasNewerActions: boolean;
};

type UseMarkAsReadResult = {
    /** Marks the newest action as read and clears any pending skipped mark-as-read */
    markNewestActionAsRead: () => void;

    /** Completes a previously skipped mark-as-read; no-op when none is pending */
    completeSkippedMarkAsRead: () => void;
};

function useMarkAsRead({reportID, report, transactionThreadReport, sortedVisibleReportActions, isScrolledToEnd, hasNewerActions}: UseMarkAsReadParams): UseMarkAsReadResult {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isFocused = useIsFocused();
    const isReportArchived = useReportIsArchived(reportID);
    const isReportActionsLoaded = useIsReportActionsLoaded(reportID);

    const [isVisible, setIsVisible] = useState(Visibility.isVisible);
    useEffect(() => {
        const unsubscribe = Visibility.onVisibilityChange(() => {
            setIsVisible(Visibility.isVisible());
        });
        return unsubscribe;
    }, []);

    const readActionSkippedRef = useRef(false);
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const didMarkReportAsReadInitially = useRef(false);
    const markedActionWasOptimisticRef = useRef(false);

    const lastAction = sortedVisibleReportActions.at(0);
    const isReportUnreadValue = isUnread(report, transactionThreadReport, isReportArchived) || (!!lastAction && isCurrentActionUnread(report, lastAction));

    useEffect(() => {
        userActiveSince.current = DateUtils.getDBTime();
        didMarkReportAsReadInitially.current = false;
        prevReportID = reportID;
    }, [reportID]);

    useEffect(() => {
        if (isAnonymousUser) {
            return;
        }

        const subscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, () => {
            userActiveSince.current = DateUtils.getDBTime();
        });
        return () => subscription.remove();
    }, [reportID, isAnonymousUser]);

    useEffect(() => {
        if (!isReportUnreadValue || didMarkReportAsReadInitially.current) {
            didMarkReportAsReadInitially.current = true;
            return;
        }

        didMarkReportAsReadInitially.current = true;
        readNewestAction(reportID, isReportActionsLoaded);
    }, [isReportUnreadValue, reportID, isReportActionsLoaded]);

    // Latch whether the action the user manually marked unread was ever seen in an optimistic (pending) state.
    // On reconnect the optimistic->confirmed merge clears isOptimisticAction/pendingAction on the same action key,
    // and that confirmation is what re-fires handleReportChangeMarkAsRead - so by then the flag is already gone.
    // We record it here, while the action is still pending, so the read effect can honor the manual-unread intent.
    useEffect(() => {
        const markedReportActionID = report?.manuallyMarkedUnreadReportActionID;
        if (!markedReportActionID) {
            markedActionWasOptimisticRef.current = false;
            return;
        }
        const markedAction = sortedVisibleReportActions.find((reportAction) => reportAction.reportActionID === markedReportActionID);
        if (markedAction?.isOptimisticAction || markedAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            markedActionWasOptimisticRef.current = true;
        }
    }, [report?.manuallyMarkedUnreadReportActionID, sortedVisibleReportActions]);

    const didMarkOnReportChangeRef = useRef(false);

    const handleReportChangeMarkAsRead = useEffectEvent(() => {
        didMarkOnReportChangeRef.current = false;
        if (reportID !== prevReportID) {
            return;
        }

        // The user marked an optimistic self-message unread while offline. When it confirms on reconnect its
        // created shifts, re-running this effect; auto-reading here would clear manuallyMarkedUnreadReportActionID
        // and drop the New marker. Honor the manual-unread intent for the action that was pending when marked.
        if (report?.manuallyMarkedUnreadReportActionID && markedActionWasOptimisticRef.current) {
            return;
        }

        const isLastActionUnread = !!lastAction && isCurrentActionUnread(report, lastAction, sortedVisibleReportActions);
        if (!isUnread(report, transactionThreadReport, isReportArchived) && !isLastActionUnread) {
            return;
        }
        const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
        const shouldReadOnReportChange = ((isVisible && Visibility.hasFocus()) || isFromNotification) && !hasNewerActions && isScrolledToEnd;

        if (shouldReadOnReportChange) {
            readNewestAction(reportID, isReportActionsLoaded);
            if (isFromNotification) {
                Navigation.setParams({referrer: undefined});
            }
            didMarkOnReportChangeRef.current = true;
            return;
        }

        readActionSkippedRef.current = true;
    });

    // Only re-run on newest-action changes; otherwise any report update can prematurely consume unread state.
    useEffect(() => {
        handleReportChangeMarkAsRead();
    }, [report?.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, reportID, isVisible, isReportActionsLoaded]);

    // isFocused is passed as an arg because the Effect Event closure can be stale (stuck true) on frozen screens,
    // re-marking a just-unread report as read on report switch
    const handleAppVisibilityMarkAsRead = useEffectEvent((isFocusedArg: boolean) => {
        if (didMarkOnReportChangeRef.current) {
            didMarkOnReportChangeRef.current = false;
            return;
        }
        if (reportID !== prevReportID) {
            return;
        }

        if (!isVisible || !Visibility.hasFocus() || !isFocusedArg) {
            if (!lastMessageTime.current) {
                lastMessageTime.current = lastAction?.created ?? '';
            }
            return;
        }

        const newMessageTimeReference = lastMessageTime.current && report?.lastReadTime && lastMessageTime.current > report.lastReadTime ? userActiveSince.current : report?.lastReadTime;
        lastMessageTime.current = null;

        const isArchivedReport = isArchivedNonExpenseReport(report, isReportArchived);
        const hasNewMessagesInView = isScrolledToEnd;
        const hasUnreadReportAction = sortedVisibleReportActions.some(
            (reportAction) =>
                newMessageTimeReference &&
                newMessageTimeReference < reportAction.created &&
                (isReportPreviewAction(reportAction) ? reportAction.childLastActorAccountID : reportAction.actorAccountID) !== currentUserAccountID,
        );

        if (!isArchivedReport && (!hasNewMessagesInView || !hasUnreadReportAction)) {
            return;
        }

        readNewestAction(reportID, true);
        userActiveSince.current = DateUtils.getDBTime();
    });

    // Only re-run when app visibility/focus changes, so action updates don't keep marking the report as read.
    useEffect(() => {
        handleAppVisibilityMarkAsRead(isFocused);
    }, [isVisible, isFocused]);

    const markNewestActionAsRead = () => {
        readActionSkippedRef.current = false;
        readNewestAction(reportID, true);
    };

    const completeSkippedMarkAsRead = () => {
        if (!readActionSkippedRef.current || !Visibility.hasFocus()) {
            return;
        }
        markNewestActionAsRead();
    };

    return {markNewestActionAsRead, completeSkippedMarkAsRead};
}

export default useMarkAsRead;
