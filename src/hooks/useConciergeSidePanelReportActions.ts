import {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction} from '@libs/ReportActionsUtils';
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
    greetingText: string;
    loadOlderChats: (force?: boolean) => void;
    showFullHistory?: boolean;
    onSetShowFullHistory?: (show: boolean) => void;
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
    showFullHistory: externalShowFullHistory,
    onSetShowFullHistory,
}: UseConciergeSidePanelReportActionsParams) {
    const [localShowFullHistory, setLocalShowFullHistory] = useState(false);
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);
    const [prevHasUserSentMessage, setPrevHasUserSentMessage] = useState(hasUserSentMessage);
    const [hadMessagesAtSessionStart, setHadMessagesAtSessionStart] = useState(
        () => !!sessionStartTime && visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime),
    );

    const showFullHistory = externalShowFullHistory ?? localShowFullHistory;
    const setShowFullHistory = onSetShowFullHistory ?? setLocalShowFullHistory;

    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        setShowFullHistory(false);
        // Determine once at session start whether unread messages already exist.
        // This value never changes for the rest of the session.
        const messagesExistAtStart = !!sessionStartTime && visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime);
        setHadMessagesAtSessionStart(messagesExistAtStart);
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setShowFullHistory(false);
    } else if (prevHasUserSentMessage !== hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
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
        return visibleReportActions.some((action) => !isCreatedAction(action) && action.created < sessionStartTime);
    }, [isConciergeHiddenHistory, visibleReportActions, sessionStartTime, hadUserMessageAtSessionStart]);

    // Check if there are any messages (from any actor) after sessionStartTime.
    // When true, we have unread content to display and should not enter welcome mode.
    const hasMessagesInSession = useMemo(() => {
        if (!isConciergeHiddenHistory || !sessionStartTime) {
            return false;
        }
        return visibleReportActions.some((action) => !isCreatedAction(action) && action.created >= sessionStartTime);
    }, [isConciergeHiddenHistory, visibleReportActions, sessionStartTime]);

    const showConciergeSidePanelWelcome = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !hasUserSentMessage && !showFullHistory && !hasMessagesInSession;
    const showConciergeGreeting = isConciergeHiddenHistory && hadUserMessageAtSessionStart && !showFullHistory && !hadMessagesAtSessionStart;

    const conciergeGreetingAction = useMemo(() => {
        if (!showConciergeGreeting) {
            return undefined;
        }
        return buildConciergeGreetingReportAction({reportID: report?.reportID, greetingText, created: sessionStartTime ?? DateUtils.getDBTime()});
    }, [showConciergeGreeting, report?.reportID, sessionStartTime, greetingText]);

    const isCurrentSessionAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!sessionStartTime) {
                return false;
            }
            return isCreatedAction(action) || action.created >= sessionStartTime;
        },
        [sessionStartTime],
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
