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
import {useCallback, useEffect, useEffectEvent, useRef, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';

import useAppFocusEvent from './useAppFocusEvent';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsAnonymousUser from './useIsAnonymousUser';
import useIsReportActionsLoaded from './useIsReportActionsLoaded';
import useReportIsArchived from './useReportIsArchived';

// useRef gets reset when the reportID changes (the list reuses the same instance per report),
// so we use a module-level map to track the previous report across re-instantiations.
// Keyed by scope so two lists mounted at the same time (the chat list and the money-request
// table view) don't clobber each other's tracking. Within a scope the entries form a stack of
// hook instances, because the same scope can also be mounted twice at once (e.g. a money-request
// list in the RHP over another one in the central pane). The newest instance owns the scope and
// releases it on unmount, so the list underneath keeps working instead of being left with a
// stale report ID.
type ScopeOwner = {instanceID: number; reportID: string | null};

const scopeOwners = new Map<string, ScopeOwner[]>();

let lastInstanceID = 0;

function getScopeReportID(scopeKey: string): string | null | undefined {
    return scopeOwners.get(scopeKey)?.at(-1)?.reportID;
}

function claimScope(scopeKey: string, instanceID: number, reportID: string | null) {
    const owners = scopeOwners.get(scopeKey) ?? [];
    const owner = owners.find((entry) => entry.instanceID === instanceID);

    if (owner) {
        owner.reportID = reportID;
    } else {
        owners.push({instanceID, reportID});
    }

    scopeOwners.set(scopeKey, owners);
}

function releaseScope(scopeKey: string, instanceID: number) {
    const owners = scopeOwners.get(scopeKey)?.filter((entry) => entry.instanceID !== instanceID);

    if (!owners?.length) {
        scopeOwners.delete(scopeKey);
        return;
    }

    scopeOwners.set(scopeKey, owners);
}

/** Test-only: clears the module-level scope tracking so state doesn't leak between test cases. */
function resetMarkAsReadScopes() {
    scopeOwners.clear();
    lastInstanceID = 0;
}

type UseMarkAsReadParams = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** All sorted actions (the full chain), scanned for unread messages when the app regains focus. Defaults to the visible actions. */
    sortedReportActions?: OnyxTypes.ReportAction[];

    isScrolledToEnd: boolean;
    hasNewerActions: boolean;

    /** Identifies the list surface consuming the hook, so unrelated surfaces don't share previous-report tracking. */
    scopeKey?: string;

    /** Skips marking as read on report change while the screen is mounted but not navigation-focused (e.g. behind a modal or details screen) */
    shouldRequireScreenFocus?: boolean;
};

type UseMarkAsReadResult = {
    /** Marks the newest action as read and clears any pending skipped mark-as-read */
    markNewestActionAsRead: () => void;

    /** Completes a previously skipped mark-as-read; no-op when none is pending */
    completeSkippedMarkAsRead: () => void;
};

function useMarkAsRead({
    reportID,
    report,
    transactionThreadReport,
    sortedVisibleReportActions,
    sortedReportActions,
    isScrolledToEnd,
    hasNewerActions,
    scopeKey = 'default',
    shouldRequireScreenFocus = false,
}: UseMarkAsReadParams): UseMarkAsReadResult {
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

    // A visible browser window can regain OS focus without any visibility change, and nothing else re-runs the
    // read catch-up in that case, so bump a counter on app focus to re-run it.
    const [appFocusCount, setAppFocusCount] = useState(0);
    useAppFocusEvent(useCallback(() => setAppFocusCount((count) => count + 1), []));

    const readActionSkippedRef = useRef(false);
    const userActiveSince = useRef<string>(DateUtils.getDBTime());
    const lastMessageTime = useRef<string | null>(null);
    const didMarkReportAsReadInitially = useRef(false);

    const lastAction = sortedVisibleReportActions.at(0);
    const isReportUnreadValue = isUnread(report, transactionThreadReport, isReportArchived) || (!!lastAction && isCurrentActionUnread(report, lastAction));

    const [instanceID] = useState(() => {
        lastInstanceID += 1;
        return lastInstanceID;
    });

    useEffect(() => {
        userActiveSince.current = DateUtils.getDBTime();
        didMarkReportAsReadInitially.current = false;
        claimScope(scopeKey, instanceID, reportID);
    }, [reportID, scopeKey, instanceID]);

    useEffect(() => () => releaseScope(scopeKey, instanceID), [scopeKey, instanceID]);

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

        if (hasNewerActions || !isScrolledToEnd) {
            return;
        }

        readNewestAction(reportID, isReportActionsLoaded);
        // `hasNewerActions` and `isScrolledToEnd` are read but intentionally left out of the deps: this effect is the
        // one-shot initial mark-as-read, and re-running it whenever the user scrolls or pagination state changes would
        // mark the report as read long after mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReportUnreadValue, reportID, isReportActionsLoaded]);

    const didMarkOnReportChangeRef = useRef(false);

    const handleReportChangeMarkAsRead = useEffectEvent(() => {
        didMarkOnReportChangeRef.current = false;
        if (reportID !== getScopeReportID(scopeKey)) {
            return;
        }

        if (shouldRequireScreenFocus && !isFocused) {
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
        if (reportID !== getScopeReportID(scopeKey)) {
            return;
        }

        if (!isVisible || !Visibility.hasFocus() || !isFocusedArg) {
            if (!lastMessageTime.current) {
                lastMessageTime.current = lastAction?.created ?? '';
            }
            return;
        }

        // readNewestAction marks everything up to now as read, so newer actions outside the loaded slice would be
        // consumed without ever being seen. Mirrors the !hasNewerActions guard on the report-change path.
        if (hasNewerActions) {
            return;
        }

        const newMessageTimeReference = lastMessageTime.current && report?.lastReadTime && lastMessageTime.current > report.lastReadTime ? userActiveSince.current : report?.lastReadTime;
        lastMessageTime.current = null;

        const isArchivedReport = isArchivedNonExpenseReport(report, isReportArchived);
        const hasNewMessagesInView = isScrolledToEnd;
        const hasUnreadReportAction = (sortedReportActions ?? sortedVisibleReportActions).some(
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
    }, [isVisible, isFocused, appFocusCount]);

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
export {resetMarkAsReadScopes};
