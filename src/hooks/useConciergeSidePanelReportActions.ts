import {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';
import type * as OnyxTypes from '@src/types/onyx';

type UseConciergeSidePanelReportActionsParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    reportActions: OnyxTypes.ReportAction[];
    visibleReportActions: OnyxTypes.ReportAction[];
    isConciergeHiddenHistory: boolean;
    hasUserSentMessage: boolean;
    hasOlderActions: boolean;
    sessionStartTime: string | null;
    currentUserAccountID: number;
    currentSessionUserActionIDs: Set<string>;
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
    currentSessionUserActionIDs,
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

    const hadMessagesAtSessionStart = localHadMessagesAtSessionStart;
    const showFullHistory = externalShowFullHistory ?? localShowFullHistory;
    const setShowFullHistory = onSetShowFullHistory ?? setLocalShowFullHistory;

    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        setLocalShowFullHistory(false);
        const messagesExistAtStart = !!isConciergeMainDM && !!sessionStartTime && visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime);
        setLocalHadMessagesAtSessionStart(messagesExistAtStart);
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setLocalShowFullHistory(false);
    } else if (prevHasUserSentMessage !== hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
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

    const showConciergeSidePanelWelcome = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !hasUserSentMessage && !showFullHistory && !hasMessagesInSession;
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
                (isCurrentUserPendingAddAction(action, currentUserAccountID) || currentSessionUserActionIDs.has(action.reportActionID) || action.created >= sessionStartTime);
            if (!isCurrentSessionUserMessage) {
                return earliest;
            }
            return !earliest || action.created < earliest ? action.created : earliest;
        }, undefined);
    }, [isConciergeMainDM, showConciergeSidePanelWelcome, isConciergeHiddenHistory, hasUserSentMessage, sessionStartTime, reportActions, currentUserAccountID, currentSessionUserActionIDs]);

    const isCurrentSessionAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!sessionStartTime) {
                return false;
            }
            if (isConciergeMainDM) {
                return (
                    isCreatedAction(action) ||
                    isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                    currentSessionUserActionIDs.has(action.reportActionID) ||
                    action.created >= sessionStartTime
                );
            }
            if (!firstUserMessageCreated) {
                return false;
            }
            return (
                isCreatedAction(action) ||
                isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                currentSessionUserActionIDs.has(action.reportActionID) ||
                (action.created >= sessionStartTime && action.created >= firstUserMessageCreated)
            );
        },
        [sessionStartTime, isConciergeMainDM, firstUserMessageCreated, currentUserAccountID, currentSessionUserActionIDs],
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
                return actions;
            }
            if (conciergeGreetingAction) {
                const createdIndex = filtered.findIndex(isCreatedAction);
                filtered.splice(createdIndex === -1 ? filtered.length : createdIndex, 0, conciergeGreetingAction);
            }
            return filtered;
        },
        [showConciergeSidePanelWelcome, conciergeGreetingAction, isConciergeHiddenHistory, showFullHistory, sessionStartTime, isCurrentSessionAction, hadUserMessageAtSessionStart],
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
