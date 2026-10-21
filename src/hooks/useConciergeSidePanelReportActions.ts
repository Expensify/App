import DateUtils from '@libs/DateUtils';
import {isCreatedAction, isCurrentUserPendingAddAction, isDeletedParentAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback, useLayoutEffect, useMemo, useState} from 'react';

/** An OPEN task assigned to the current user. Canceled tasks stay OPEN optimistically, so deleted parents are excluded. */
function isOpenChildTaskAction(action: OnyxTypes.ReportAction, currentUserAccountID: number): boolean {
    return (
        action.childType === CONST.REPORT.TYPE.TASK &&
        action.childManagerAccountID === currentUserAccountID &&
        action.childStateNum === CONST.REPORT.STATE_NUM.OPEN &&
        action.childStatusNum === CONST.REPORT.STATUS_NUM.OPEN &&
        !isDeletedParentAction(action)
    );
}

type UseConciergeSidePanelReportActionsParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    reportActions: OnyxTypes.ReportAction[];
    visibleReportActions: OnyxTypes.ReportAction[];
    isConciergeHiddenHistory: boolean;
    hasUserSentMessage: boolean;
    hasOlderActions: boolean;
    sessionStartTime: string | null;
    currentUserAccountID: number;
    greetingText: string;
    loadOlderChats: (force?: boolean) => void;
    isConciergeMainDM?: boolean;
    showFullHistory?: boolean;
    onSetShowFullHistory?: (show: boolean) => void;
    hadMessagesAtSessionStart?: boolean;
    onSetHadMessagesAtSessionStart?: (value: boolean) => void;
};

function useConciergeSidePanelReportActions({
    report,
    reportActions,
    visibleReportActions,
    isConciergeHiddenHistory,
    hasUserSentMessage,
    hasOlderActions,
    sessionStartTime,
    currentUserAccountID,
    greetingText,
    loadOlderChats,
    isConciergeMainDM,
    showFullHistory: externalShowFullHistory,
    onSetShowFullHistory,
    hadMessagesAtSessionStart: externalHadMessagesAtSessionStart,
    onSetHadMessagesAtSessionStart,
}: UseConciergeSidePanelReportActionsParams) {
    const [localShowFullHistory, setLocalShowFullHistory] = useState(false);
    const [localHadMessagesAtSessionStart, setLocalHadMessagesAtSessionStart] = useState(
        () =>
            externalHadMessagesAtSessionStart ??
            (!!isConciergeMainDM && !!sessionStartTime && visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime)),
    );
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);
    const [prevHasUserSentMessage, setPrevHasUserSentMessage] = useState(hasUserSentMessage);

    // Actions sent this session, captured while pending. The server can re-stamp `created` below the boundary, so keep
    // them sticky rather than re-deriving visibility from the timestamp.
    const [sessionSentActionIDs, setSessionSentActionIDs] = useState<ReadonlySet<string>>(() => new Set());

    const hadMessagesAtSessionStart = localHadMessagesAtSessionStart;
    const showFullHistory = externalShowFullHistory ?? localShowFullHistory;
    const setShowFullHistory = onSetShowFullHistory ?? setLocalShowFullHistory;

    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        setLocalShowFullHistory(false);
        const messagesExistAtStart = !!isConciergeMainDM && !!sessionStartTime && visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime);
        setLocalHadMessagesAtSessionStart(messagesExistAtStart);
        setSessionSentActionIDs(new Set());
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setLocalShowFullHistory(false);
    } else if (prevHasUserSentMessage !== hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
    }

    const pendingSentActionIDs =
        isConciergeHiddenHistory && sessionStartTime
            ? visibleReportActions.filter((action) => isCurrentUserPendingAddAction(action, currentUserAccountID)).map((action) => action.reportActionID)
            : [];
    if (pendingSentActionIDs.some((reportActionID) => !sessionSentActionIDs.has(reportActionID))) {
        setSessionSentActionIDs((prev) => new Set([...prev, ...pendingSentActionIDs]));
    }

    useLayoutEffect(() => {
        onSetHadMessagesAtSessionStart?.(localHadMessagesAtSessionStart);
    }, [localHadMessagesAtSessionStart, onSetHadMessagesAtSessionStart]);

    // Check if the user had sent any message BEFORE this session started.
    // Uses sessionStartTime as the boundary — any user message created before the
    // panel opened is a pre-session message, regardless of when it was loaded.
    //
    // When no user message is found in the loaded set, hasOlderActions indicates
    // whether there is unloaded history. On a new account all onboarding messages
    // fit in a single page (hasOlderActions=false). On an existing account with
    // prior interactions the history spans multiple pages (hasOlderActions=true).
    //
    const hadUserMessageAtSessionStart = useMemo(() => {
        if (!isConciergeHiddenHistory || !sessionStartTime) {
            return false;
        }
        const hasUserMessageInLoadedSet = visibleReportActions.some(
            (action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created < sessionStartTime,
        );
        return hasUserMessageInLoadedSet || hasOlderActions;
    }, [isConciergeHiddenHistory, visibleReportActions, currentUserAccountID, sessionStartTime, hasOlderActions]);

    const hasPreviousMessages = useMemo(() => {
        if (!isConciergeHiddenHistory || !hadUserMessageAtSessionStart || !sessionStartTime) {
            return false;
        }
        const hasPreSessionActionInLoadedSet = visibleReportActions.some((action) => !isCreatedAction(action) && action.created < sessionStartTime);
        return hasPreSessionActionInLoadedSet || hasOlderActions;
    }, [isConciergeHiddenHistory, visibleReportActions, sessionStartTime, hadUserMessageAtSessionStart, hasOlderActions]);

    // Main DM only: check if there are any messages (from any actor) after sessionStartTime.
    // When true, we have unread content to display and should not enter welcome mode.
    const hasMessagesInSession = useMemo(() => {
        if (!isConciergeMainDM || !isConciergeHiddenHistory || !sessionStartTime) {
            return false;
        }
        return visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime);
    }, [isConciergeMainDM, isConciergeHiddenHistory, visibleReportActions, sessionStartTime]);

    // Main DM only: the welcome state must stand down for a pinned task, or `filterActions` returns before it renders.
    const hasOpenChildTask = useMemo(() => {
        if (!isConciergeMainDM || !isConciergeHiddenHistory) {
            return false;
        }
        return visibleReportActions.some((action) => isOpenChildTaskAction(action, currentUserAccountID));
    }, [isConciergeMainDM, isConciergeHiddenHistory, visibleReportActions, currentUserAccountID]);

    // A re-stamp flips `hasUserSentMessage` too, so the sticky set is what keeps the welcome state from coming back.
    const hasSentInSession = hasUserSentMessage || sessionSentActionIDs.size > 0;
    const showConciergeSidePanelWelcome = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !hasSentInSession && !showFullHistory && !hasMessagesInSession && !hasOpenChildTask;
    const showConciergeGreeting = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !showFullHistory && (!isConciergeMainDM || !hadMessagesAtSessionStart);

    const conciergeGreetingAction = useMemo(() => {
        if (!showConciergeGreeting) {
            return undefined;
        }
        const created = report?.lastReadTime ?? DateUtils.getDBTime();
        return buildConciergeGreetingReportAction({reportID: report?.reportID, greetingText, created});
    }, [showConciergeGreeting, report?.reportID, report?.lastReadTime, greetingText]);

    // Side panel only: find the first user message in the current session.
    // Used to filter actions so that only messages from the first user message
    // onwards are shown (upstream side panel behavior).
    const firstUserMessageCreated = useMemo(() => {
        if (isConciergeMainDM || showConciergeSidePanelWelcome || !isConciergeHiddenHistory || !hasUserSentMessage || !sessionStartTime) {
            return undefined;
        }
        return reportActions.reduce<string | undefined>((earliest, action) => {
            const isCurrentSessionUserMessage =
                !isCreatedAction(action) &&
                action.actorAccountID === currentUserAccountID &&
                (isCurrentUserPendingAddAction(action, currentUserAccountID) || action.created >= sessionStartTime);
            if (!isCurrentSessionUserMessage) {
                return earliest;
            }
            return !earliest || action.created < earliest ? action.created : earliest;
        }, undefined);
    }, [isConciergeMainDM, showConciergeSidePanelWelcome, isConciergeHiddenHistory, hasUserSentMessage, sessionStartTime, reportActions, currentUserAccountID]);

    const isCurrentSessionAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!sessionStartTime) {
                return false;
            }
            // Already shown this session — keep it whatever the server stamped on it.
            if (sessionSentActionIDs.has(action.reportActionID)) {
                return true;
            }
            if (isConciergeMainDM) {
                // Pin a still-open task so collapsing read history never buries something the user has to act on.
                return (
                    isCreatedAction(action) ||
                    isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                    isOpenChildTaskAction(action, currentUserAccountID) ||
                    action.created >= sessionStartTime
                );
            }
            if (!firstUserMessageCreated) {
                return false;
            }
            // The firstUserMessageCreated floor only trims the user's OWN pre-question messages, so apply it to
            // current-user actions alone. Concierge replies are server-stamped and already bounded by the
            // server-anchored sessionStartTime; gating them on the question's `created` would hide a reply whenever
            // that `created` was clamped forward onto an ahead client clock to stay monotonic across sends.
            const isFromCurrentUser = action.actorAccountID === currentUserAccountID;
            return (
                isCreatedAction(action) ||
                isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                (action.created >= sessionStartTime && (!isFromCurrentUser || action.created >= firstUserMessageCreated))
            );
        },
        [sessionStartTime, isConciergeMainDM, firstUserMessageCreated, currentUserAccountID, sessionSentActionIDs],
    );

    const filterActions = useCallback(
        (actions: OnyxTypes.ReportAction[]): OnyxTypes.ReportAction[] => {
            if (showConciergeSidePanelWelcome && conciergeGreetingAction) {
                const createdAction = actions.find(isCreatedAction);
                return createdAction ? [conciergeGreetingAction, createdAction] : [conciergeGreetingAction];
            }
            if (!isConciergeHiddenHistory || showFullHistory) {
                return actions;
            }
            if (!sessionStartTime) {
                return actions.filter(isCreatedAction);
            }
            if (!hadUserMessageAtSessionStart) {
                return actions;
            }
            const filtered = actions.filter(isCurrentSessionAction);
            if (filtered.length === 0) {
                // Side panel: nothing matched the current session yet (e.g. just after reopen, before the new
                // message propagates). Show the greeting instead of `actions` to avoid flashing stale history.
                if (!isConciergeMainDM && conciergeGreetingAction) {
                    const createdAction = actions.find(isCreatedAction);
                    return createdAction ? [conciergeGreetingAction, createdAction] : [conciergeGreetingAction];
                }
                return actions;
            }
            if (conciergeGreetingAction) {
                const createdIndex = filtered.findIndex(isCreatedAction);
                filtered.splice(createdIndex === -1 ? filtered.length : createdIndex, 0, conciergeGreetingAction);
            }
            return filtered;
        },
        [
            showConciergeSidePanelWelcome,
            conciergeGreetingAction,
            isConciergeHiddenHistory,
            showFullHistory,
            sessionStartTime,
            isCurrentSessionAction,
            hadUserMessageAtSessionStart,
            isConciergeMainDM,
        ],
    );

    const filteredVisibleActions = useMemo(() => filterActions(visibleReportActions), [filterActions, visibleReportActions]);
    const filteredReportActions = useMemo(() => filterActions(reportActions), [filterActions, reportActions]);

    const handleShowPreviousMessages = useCallback(() => {
        setShowFullHistory(true);
        loadOlderChats(true);
    }, [setShowFullHistory, loadOlderChats]);

    return {
        filteredVisibleActions,
        filteredReportActions,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    };
}

export default useConciergeSidePanelReportActions;
