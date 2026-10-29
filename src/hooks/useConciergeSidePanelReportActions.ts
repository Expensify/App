import DateUtils from '@libs/DateUtils';
import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useState} from 'react';

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
}: UseConciergeSidePanelReportActionsParams) {
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);
    const [prevHasUserSentMessage, setPrevHasUserSentMessage] = useState(hasUserSentMessage);

    // Actions sent this session, captured while pending. The server can re-stamp `created` below the boundary, so keep
    // them sticky rather than re-deriving visibility from the timestamp.
    const [sessionSentActionIDs, setSessionSentActionIDs] = useState<ReadonlySet<string>>(() => new Set());

    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        setShowFullHistory(false);
        setSessionSentActionIDs(new Set());
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setShowFullHistory(false);
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

    // Check if the user had sent any message BEFORE this session started.
    // Uses sessionStartTime as the boundary — any user message created before the
    // panel opened is a pre-session message, regardless of when it was loaded.
    //
    // When no user message is found in the loaded set, hasOlderActions indicates
    // whether there is unloaded history. On a new account all onboarding messages
    // fit in a single page (hasOlderActions=false). On an existing account with
    // prior interactions the history spans multiple pages (hasOlderActions=true).
    //
    let hadUserMessageAtSessionStart;
    if (!isConciergeHiddenHistory || !sessionStartTime) {
        hadUserMessageAtSessionStart = false;
    } else {
        const hasUserMessageInLoadedSet = visibleReportActions.some(
            (action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created < sessionStartTime,
        );
        hadUserMessageAtSessionStart = hasUserMessageInLoadedSet || hasOlderActions;
    }

    let hasPreviousMessages;
    if (!isConciergeHiddenHistory || !hadUserMessageAtSessionStart || !sessionStartTime) {
        hasPreviousMessages = false;
    } else {
        const hasPreSessionActionInLoadedSet = visibleReportActions.some((action) => !isCreatedAction(action) && action.created < sessionStartTime);
        hasPreviousMessages = hasPreSessionActionInLoadedSet || hasOlderActions;
    }

    // A re-stamp flips `hasUserSentMessage` too, so the sticky set is what keeps the welcome state from coming back.
    const hasSentInSession = hasUserSentMessage || sessionSentActionIDs.size > 0;
    const showConciergeSidePanelWelcome = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !hasSentInSession && !showFullHistory;
    const showConciergeGreeting = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !showFullHistory;

    let conciergeGreetingAction;
    if (!showConciergeGreeting) {
        conciergeGreetingAction = undefined;
    } else {
        const created = report?.lastReadTime ?? DateUtils.getDBTime();
        conciergeGreetingAction = buildConciergeGreetingReportAction({
            reportID: report?.reportID,
            greetingText,
            created,
        });
    }

    // Side panel only: find the first user message in the current session.
    // Used to filter actions so that only messages from the first user message
    // onwards are shown (upstream side panel behavior).
    const firstUserMessageCreated =
        showConciergeSidePanelWelcome || !isConciergeHiddenHistory || !hasUserSentMessage || !sessionStartTime
            ? undefined
            : reportActions.reduce<string | undefined>((earliest, action) => {
                  const isCurrentSessionUserMessage =
                      !isCreatedAction(action) &&
                      action.actorAccountID === currentUserAccountID &&
                      (isCurrentUserPendingAddAction(action, currentUserAccountID) || action.created >= sessionStartTime);
                  if (!isCurrentSessionUserMessage) {
                      return earliest;
                  }
                  return !earliest || action.created < earliest ? action.created : earliest;
              }, undefined);

    const isCurrentSessionAction = (action: OnyxTypes.ReportAction): boolean => {
        if (!sessionStartTime) {
            return false;
        }
        // Already shown this session — keep it whatever the server stamped on it.
        if (sessionSentActionIDs.has(action.reportActionID)) {
            return true;
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
    };

    const filterActions = (actions: OnyxTypes.ReportAction[]): OnyxTypes.ReportAction[] => {
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
            if (conciergeGreetingAction) {
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
    };

    const filteredVisibleActions = filterActions(visibleReportActions);
    const filteredReportActions = filterActions(reportActions);

    const handleShowPreviousMessages = () => {
        setShowFullHistory(true);
        loadOlderChats(true);
    };

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
