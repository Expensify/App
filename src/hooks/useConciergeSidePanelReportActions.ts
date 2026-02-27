import {useCallback, useMemo, useState} from 'react';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';
import type * as OnyxTypes from '@src/types/onyx';

type UseConciergeSidePanelReportActionsParams = {
    report: OnyxTypes.Report;
    reportActions: OnyxTypes.ReportAction[];
    visibleReportActions: OnyxTypes.ReportAction[];
    isConciergeSidePanel: boolean;
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
    isConciergeSidePanel,
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

    if (prevSessionStartTime !== sessionStartTime) {
        setPrevSessionStartTime(sessionStartTime);
        setShowFullHistory(false);
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setShowFullHistory(false);
    } else if (prevHasUserSentMessage !== hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
    }

    // Check if the user had sent any message BEFORE this session started.
    // Uses sessionStartTime as the boundary — any user message created before the
    // panel opened is a pre-session message, regardless of when it was loaded.
    // This avoids the race condition where action IDs are locked before
    // all actions (including user messages) have loaded.
    //
    // When no user message is found in the loaded set, hasOlderActions indicates
    // whether there is unloaded history. On a new account all onboarding messages
    // fit in a single page (hasOlderActions=false). On an existing account with
    // prior interactions the history spans multiple pages (hasOlderActions=true).
    const hadUserMessageAtSessionStart = useMemo(() => {
        if (!isConciergeSidePanel || !sessionStartTime) {
            return false;
        }
        const hasUserMessageInLoadedSet = visibleReportActions.some(
            (action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created < sessionStartTime,
        );
        return hasUserMessageInLoadedSet || hasOlderActions;
    }, [isConciergeSidePanel, visibleReportActions, currentUserAccountID, sessionStartTime, hasOlderActions]);

    const hasPreviousMessages = useMemo(() => {
        if (!isConciergeSidePanel || !hadUserMessageAtSessionStart || !sessionStartTime) {
            return false;
        }
        return visibleReportActions.some((action) => !isCreatedAction(action) && action.created < sessionStartTime);
    }, [isConciergeSidePanel, visibleReportActions, sessionStartTime, hadUserMessageAtSessionStart]);

    const showConciergeSidePanelWelcome = isConciergeSidePanel && hadUserMessageAtSessionStart && !hasUserSentMessage && !showFullHistory;
    const showConciergeGreeting = isConciergeSidePanel && hadUserMessageAtSessionStart && !showFullHistory;

    const conciergeGreetingAction = useMemo(() => {
        if (!showConciergeGreeting) {
            return undefined;
        }
        return buildConciergeGreetingReportAction(report.reportID, greetingText, report.lastReadTime ?? DateUtils.getDBTime());
    }, [showConciergeGreeting, report.reportID, report.lastReadTime, greetingText]);

    const firstUserMessageCreated = useMemo(() => {
        if (showConciergeSidePanelWelcome || !isConciergeSidePanel || !hasUserSentMessage || !sessionStartTime) {
            return undefined;
        }
        return reportActions.reduce<string | undefined>((earliest, action) => {
            if (isCreatedAction(action) || action.created < sessionStartTime || action.actorAccountID !== currentUserAccountID) {
                return earliest;
            }
            return !earliest || action.created < earliest ? action.created : earliest;
        }, undefined);
    }, [showConciergeSidePanelWelcome, isConciergeSidePanel, hasUserSentMessage, sessionStartTime, reportActions, currentUserAccountID]);

    const isCurrentSessionAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!firstUserMessageCreated || !sessionStartTime) {
                return false;
            }
            return isCreatedAction(action) || (action.created >= sessionStartTime && action.created >= firstUserMessageCreated);
        },
        [firstUserMessageCreated, sessionStartTime],
    );

    const filterActions = useCallback(
        (actions: OnyxTypes.ReportAction[]): OnyxTypes.ReportAction[] => {
            if (showConciergeSidePanelWelcome && conciergeGreetingAction) {
                const createdAction = actions.find(isCreatedAction);
                return createdAction ? [conciergeGreetingAction, createdAction] : [conciergeGreetingAction];
            }
            if (!isConciergeSidePanel || showFullHistory || !hadUserMessageAtSessionStart) {
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
        [showConciergeSidePanelWelcome, conciergeGreetingAction, isConciergeSidePanel, showFullHistory, isCurrentSessionAction, hadUserMessageAtSessionStart],
    );

    const filteredVisibleActions = useMemo(() => filterActions(visibleReportActions), [filterActions, visibleReportActions]);
    const filteredReportActions = useMemo(() => filterActions(reportActions), [filterActions, reportActions]);

    const handleShowPreviousMessages = useCallback(() => {
        setShowFullHistory(true);
        loadOlderChats(true);
    }, [loadOlderChats]);

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
