import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect, useRef, useSyncExternalStore} from 'react';
import type {RefObject} from 'react';
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

// Seems that there is an architecture issue that prevents us from using the reportID with useRef
// the useRef value gets reset when the reportID changes, so we use a global variable to keep track
let prevReportID: string | null = null;

type UseMarkAsReadParams = {
    reportID: string;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    scrollingVerticalOffset: RefObject<number>;
};

type UseMarkAsReadResult = {
    readActionSkippedRef: RefObject<boolean>;
};

function useMarkAsRead({reportID, sortedVisibleReportActions, transactionThreadReport, scrollingVerticalOffset}: UseMarkAsReadParams): UseMarkAsReadResult {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isFocused = useIsFocused();
    const isReportArchived = useReportIsArchived(reportID);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);

    const isVisible = useSyncExternalStore(Visibility.onVisibilityChange, Visibility.isVisible);

    const readActionSkippedRef = useRef(false);
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);

    const lastAction = sortedVisibleReportActions.at(0);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, () => {
            userActiveSince.current = DateUtils.getDBTime();
        });
        return () => subscription.remove();
    }, [reportID]);

    function handleReportChangeMarkAsRead() {
        if (reportID !== prevReportID) {
            return;
        }

        if (isUnread(report, transactionThreadReport, isReportArchived) || (lastAction && isCurrentActionUnread(report, lastAction, sortedVisibleReportActions))) {
            // On desktop, when the notification center is displayed, isVisible will return false.
            // Currently, there's no programmatic way to dismiss the notification center panel.
            // To handle this, we use the 'referrer' parameter to check if the current navigation is triggered from a notification.
            const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
            if ((isVisible || isFromNotification) && scrollingVerticalOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
                readNewestAction(reportID, !!reportMetadata?.hasOnceLoadedReportActions);
                if (isFromNotification) {
                    Navigation.setParams({referrer: undefined});
                }
                return true;
            }

            readActionSkippedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    function handleAppVisibilityMarkAsRead() {
        if (reportID !== prevReportID) {
            return;
        }

        if (!isVisible || !isFocused) {
            if (!lastMessageTime.current) {
                lastMessageTime.current = lastAction?.created ?? '';
            }
            return;
        }

        // In case the user read new messages (after being inactive) with other device we should
        // show marker based on report.lastReadTime
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

        readNewestAction(reportID, !!reportMetadata?.hasOnceLoadedReportActions);
        userActiveSince.current = DateUtils.getDBTime();
        return true;

        // This effect logic to `mark as read` will only run when the report focused has new messages and the App visibility
        //  is changed to visible(meaning user switched to app/web, while user was previously using different tab or application).
        // We will mark the report as read in the above case which marks the LHN report item as read while showing the new message
        // marker for the chat messages received while the user wasn't focused on the report or on another browser tab for web.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    useEffect(() => {
        // handleReportChangeMarkAsRead short-circuits via isMarkedAsRead to prevent duplicate readNewestAction calls.
        const isMarkedAsRead = !!handleReportChangeMarkAsRead();
        if (!isMarkedAsRead) {
            handleAppVisibilityMarkAsRead();
        }
        prevReportID = reportID;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, reportID, isVisible, isFocused, reportMetadata?.hasOnceLoadedReportActions]);

    return {readActionSkippedRef};
}

export default useMarkAsRead;
