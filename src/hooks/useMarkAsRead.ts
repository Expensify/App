import {useIsFocused, useRoute} from '@react-navigation/native';
import type {RefObject} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
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
import useAppFocusEvent from './useAppFocusEvent';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsAnonymousUser from './useIsAnonymousUser';
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
    isScrolledToEnd: boolean;
    hasNewerActions: boolean;
};

type UseMarkAsReadResult = {
    readActionSkippedRef: RefObject<boolean>;
};

function useMarkAsRead({reportID, report, transactionThreadReport, sortedVisibleReportActions, isScrolledToEnd, hasNewerActions}: UseMarkAsReadParams): UseMarkAsReadResult {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isFocused = useIsFocused();
    const isReportArchived = useReportIsArchived(reportID);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);

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
        readNewestAction(reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
    }, [isReportUnreadValue, reportID, reportLoadingState?.hasOnceLoadedReportActions]);

    const didMarkOnReportChangeRef = useRef(false);

    useEffect(() => {
        didMarkOnReportChangeRef.current = false;
        if (reportID !== prevReportID) {
            return;
        }

        const isLastActionUnread = !!lastAction && isCurrentActionUnread(report, lastAction, sortedVisibleReportActions);
        if (!isUnread(report, transactionThreadReport, isReportArchived) && !isLastActionUnread) {
            return;
        }
        const isFromNotification = route?.params?.referrer === CONST.REFERRER.NOTIFICATION;
        const shouldReadOnReportChange = ((isVisible && Visibility.hasFocus()) || isFromNotification) && !hasNewerActions && isScrolledToEnd;

        if (shouldReadOnReportChange) {
            readNewestAction(reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
            if (isFromNotification) {
                Navigation.setParams({referrer: undefined});
            }
            didMarkOnReportChangeRef.current = true;
            return;
        }

        readActionSkippedRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.lastVisibleActionCreated, transactionThreadReport?.lastVisibleActionCreated, reportID, isVisible, reportLoadingState?.hasOnceLoadedReportActions]);

    const markAsReadWhenVisibleAndFocused = useCallback(() => {
        if (didMarkOnReportChangeRef.current) {
            didMarkOnReportChangeRef.current = false;
            return;
        }
        if (reportID !== prevReportID) {
            return;
        }

        if (!isVisible || !Visibility.hasFocus() || !isFocused) {
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

        readNewestAction(reportID, !!reportLoadingState?.hasOnceLoadedReportActions);
        userActiveSince.current = DateUtils.getDBTime();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentUserAccountID,
        isFocused,
        isReportArchived,
        isScrolledToEnd,
        isVisible,
        lastAction?.created,
        report,
        reportID,
        reportLoadingState?.hasOnceLoadedReportActions,
        sortedVisibleReportActions,
    ]);

    useEffect(() => {
        markAsReadWhenVisibleAndFocused();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, isFocused, reportLoadingState?.hasOnceLoadedReportActions]);

    useAppFocusEvent(markAsReadWhenVisibleAndFocused);

    return {readActionSkippedRef};
}

export default useMarkAsRead;
