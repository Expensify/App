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
    isLoadingInitialReportActions?: boolean;
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
    isLoadingInitialReportActions,
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
    //
    // When the report data is still loading (isLoadingInitialReportActions !== false),
    // we default to true to avoid briefly flashing the full chat history while
    // metadata (hasOlderActions) hasn't arrived yet. Once loading completes, the
    // actual value is computed from the loaded actions and hasOlderActions.
    const hadUserMessageAtSessionStart = useMemo(() => {
        if (!isConciergeSidePanel || !sessionStartTime) {
            return false;
        }
        const hasUserMessageInLoadedSet = visibleReportActions.some(
            (action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created < sessionStartTime,
        );
        return hasUserMessageInLoadedSet || hasOlderActions || isLoadingInitialReportActions !== false;
    }, [isConciergeSidePanel, visibleReportActions, currentUserAccountID, sessionStartTime, hasOlderActions, isLoadingInitialReportActions]);

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
            if (!isConciergeSidePanel || showFullHistory) {
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
        [showConciergeSidePanelWelcome, conciergeGreetingAction, isConciergeSidePanel, showFullHistory, sessionStartTime, isCurrentSessionAction, hadUserMessageAtSessionStart],
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
