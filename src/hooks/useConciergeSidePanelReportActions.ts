import {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {setConciergeShowFullHistory} from '@libs/actions/ConciergeSession';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';

type UseConciergeReportActionsParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    reportActions: OnyxTypes.ReportAction[];
    visibleReportActions: OnyxTypes.ReportAction[];
    isConciergeChat: boolean;
    hasUserSentMessage: boolean;
    hasOlderActions: boolean;
    sessionStartTime: string | null;
    currentUserAccountID: number;
    greetingText: string;
    loadOlderChats: (force?: boolean) => void;
    reportActionIDFromRoute?: string;
};

function useConciergeReportActions({
    report,
    reportActions,
    visibleReportActions,
    isConciergeChat,
    hasUserSentMessage,
    hasOlderActions,
    sessionStartTime,
    currentUserAccountID,
    greetingText,
    loadOlderChats,
    reportActionIDFromRoute,
}: UseConciergeReportActionsParams) {
    const isInSidePanel = useIsInSidePanel();
    const [persistedShowFullHistory = false] = useOnyx(ONYXKEYS.RAM_ONLY_CONCIERGE_SHOW_FULL_HISTORY);

    const [showFullHistory, setShowFullHistoryState] = useState(() => (isInSidePanel ? false : persistedShowFullHistory));
    const [prevPersistedShowFullHistory, setPrevPersistedShowFullHistory] = useState(persistedShowFullHistory);
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);
    const [prevHasUserSentMessage, setPrevHasUserSentMessage] = useState(hasUserSentMessage);

    // Only sync from persisted Onyx key for the main DM, not the side panel.
    if (!isInSidePanel && prevPersistedShowFullHistory !== persistedShowFullHistory) {
        setPrevPersistedShowFullHistory(persistedShowFullHistory);
        setShowFullHistoryState(persistedShowFullHistory);
    }

    const hasSessionChanged = sessionStartTime && prevSessionStartTime && prevSessionStartTime !== sessionStartTime;

    if (hasSessionChanged) {
        setPrevSessionStartTime(sessionStartTime);
        setShowFullHistoryState(false);
        if (!isInSidePanel) {
            setConciergeShowFullHistory(false);
        }
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setShowFullHistoryState(false);
        if (!isInSidePanel) {
            setConciergeShowFullHistory(false);
        }
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
        if (!isConciergeChat || !sessionStartTime) {
            return false;
        }
        const hasUserMessageInLoadedSet = visibleReportActions.some(
            (action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created < sessionStartTime,
        );
        return hasUserMessageInLoadedSet || hasOlderActions;
    }, [isConciergeChat, visibleReportActions, currentUserAccountID, sessionStartTime, hasOlderActions]);

    const hasUnreadMessages = useMemo(() => {
        if (!isConciergeChat || !sessionStartTime) {
            return false;
        }
        return visibleReportActions.some((action) => !isCreatedAction(action) && action.created > sessionStartTime && action.actorAccountID !== currentUserAccountID);
    }, [isConciergeChat, visibleReportActions, sessionStartTime, currentUserAccountID]);

    const hasPreviousMessages = useMemo(() => {
        if (!isConciergeChat || !sessionStartTime || !hadUserMessageAtSessionStart) {
            return false;
        }
        const hasReadMessagesInLoadedSet = visibleReportActions.some((action) => !isCreatedAction(action) && action.created <= sessionStartTime);
        return hasReadMessagesInLoadedSet || hasOlderActions;
    }, [isConciergeChat, visibleReportActions, sessionStartTime, hadUserMessageAtSessionStart, hasOlderActions]);

    const showConciergeWelcome = isConciergeChat && hadUserMessageAtSessionStart && !hasUserSentMessage && !hasUnreadMessages && !showFullHistory;

    // The greeting is available whenever history is hidden, not just in the
    // welcome state. This allows it to persist after the user sends a message.
    const shouldCreateGreeting = isConciergeChat && hadUserMessageAtSessionStart && !showFullHistory;

    const conciergeGreetingAction = useMemo(() => {
        if (!shouldCreateGreeting) {
            return undefined;
        }
        return buildConciergeGreetingReportAction({reportID: report?.reportID, greetingText, created: report?.lastReadTime ?? DateUtils.getDBTime()});
    }, [shouldCreateGreeting, report?.reportID, report?.lastReadTime, greetingText]);

    const firstUserMessageCreated = useMemo(() => {
        if (showConciergeWelcome || !isConciergeChat || !hasUserSentMessage || !sessionStartTime) {
            return undefined;
        }
        return reportActions.reduce<string | undefined>((earliest, action) => {
            if (isCreatedAction(action) || action.created <= sessionStartTime || action.actorAccountID !== currentUserAccountID) {
                return earliest;
            }
            return !earliest || action.created < earliest ? action.created : earliest;
        }, undefined);
    }, [showConciergeWelcome, isConciergeChat, hasUserSentMessage, sessionStartTime, reportActions, currentUserAccountID]);

    const isCurrentSessionAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!firstUserMessageCreated || !sessionStartTime) {
                return false;
            }
            return isCreatedAction(action) || (action.created > sessionStartTime && action.created >= firstUserMessageCreated);
        },
        [firstUserMessageCreated, sessionStartTime],
    );

    const isUnreadAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!sessionStartTime) {
                return false;
            }
            return isCreatedAction(action) || action.created > sessionStartTime;
        },
        [sessionStartTime],
    );

    const filterActions = useCallback(
        (actions: OnyxTypes.ReportAction[]): OnyxTypes.ReportAction[] => {
            if (showConciergeWelcome && conciergeGreetingAction) {
                const createdAction = actions.find(isCreatedAction);
                return createdAction ? [conciergeGreetingAction, createdAction] : [conciergeGreetingAction];
            }
            if (!isConciergeChat || showFullHistory || reportActionIDFromRoute) {
                return actions;
            }
            if (!sessionStartTime) {
                return actions.filter(isCreatedAction);
            }
            if (!hadUserMessageAtSessionStart) {
                return actions;
            }

            if (hasUnreadMessages && !hasUserSentMessage) {
                return actions.filter(isUnreadAction);
            }

            // When there are unread messages and the user replied (e.g. clicked
            // a suggestion button), keep all actions after sessionStartTime so
            // the previously visible unread messages don't disappear.
            const filterFn = hasUnreadMessages ? isUnreadAction : isCurrentSessionAction;
            const filtered = actions.filter(filterFn);
            if (filtered.length === 0) {
                return actions;
            }
            if (conciergeGreetingAction) {
                const createdIdx = filtered.findIndex(isCreatedAction);
                if (createdIdx !== -1) {
                    const result = [...filtered];
                    result.splice(createdIdx, 0, conciergeGreetingAction);
                    return result;
                }
                return [...filtered, conciergeGreetingAction];
            }
            return filtered;
        },
        [
            showConciergeWelcome,
            conciergeGreetingAction,
            isConciergeChat,
            showFullHistory,
            reportActionIDFromRoute,
            sessionStartTime,
            isCurrentSessionAction,
            hadUserMessageAtSessionStart,
            hasUnreadMessages,
            hasUserSentMessage,
            isUnreadAction,
        ],
    );

    const filteredVisibleActions = useMemo(() => filterActions(visibleReportActions), [filterActions, visibleReportActions]);
    const filteredReportActions = useMemo(() => filterActions(reportActions), [filterActions, reportActions]);

    const handleShowPreviousMessages = useCallback(() => {
        setShowFullHistoryState(true);
        if (!isInSidePanel) {
            setConciergeShowFullHistory(true);
        }
        loadOlderChats(true);
    }, [loadOlderChats, isInSidePanel]);

    return {
        filteredVisibleActions,
        filteredReportActions,
        showConciergeWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    };
}

export default useConciergeReportActions;
