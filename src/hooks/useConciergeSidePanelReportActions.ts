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
    sessionStartActionIDs: Set<string> | null;
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
    sessionStartActionIDs,
    currentUserAccountID,
    greetingText,
    loadOlderChats,
}: UseConciergeSidePanelReportActionsParams) {
    const [showFullHistory, setShowFullHistory] = useState(false);
    const [prevHasUserSentMessage, setPrevHasUserSentMessage] = useState(hasUserSentMessage);
    if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setShowFullHistory(false);
    } else if (prevHasUserSentMessage !== hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
    }

    // Check if the user had sent any message BEFORE this session started.
    // Uses sessionStartActionIDs so the value is stable within a session —
    // it won't flip when the user sends their first-ever message mid-session.
    // On a brand-new account (no prior user messages) the original onboarding
    // messages remain visible instead of being replaced by the custom greeting.
    const hadUserMessageAtSessionStart = useMemo(() => {
        if (!isConciergeSidePanel || !sessionStartActionIDs) {
            return false;
        }
        return visibleReportActions.some((action) => !isCreatedAction(action) && sessionStartActionIDs.has(action.reportActionID) && action.actorAccountID === currentUserAccountID);
    }, [isConciergeSidePanel, visibleReportActions, sessionStartActionIDs, currentUserAccountID]);

    const hasPreviousMessages = useMemo(() => {
        if (!isConciergeSidePanel || !sessionStartActionIDs || !hadUserMessageAtSessionStart) {
            return false;
        }
        return visibleReportActions.some((action) => !isCreatedAction(action) && sessionStartActionIDs.has(action.reportActionID));
    }, [isConciergeSidePanel, visibleReportActions, sessionStartActionIDs, hadUserMessageAtSessionStart]);

    const showConciergeSidePanelWelcome = isConciergeSidePanel && hadUserMessageAtSessionStart && !hasUserSentMessage && !showFullHistory;
    const showConciergeGreeting = isConciergeSidePanel && hadUserMessageAtSessionStart && !showFullHistory;

    const conciergeGreetingAction = useMemo(() => {
        if (!showConciergeGreeting) {
            return undefined;
        }
        return buildConciergeGreetingReportAction(report.reportID, greetingText, report.lastReadTime ?? DateUtils.getDBTime());
    }, [showConciergeGreeting, report.reportID, report.lastReadTime, greetingText]);

    const firstUserMessageCreated = useMemo(() => {
        if (showConciergeSidePanelWelcome || !isConciergeSidePanel || !hasUserSentMessage || !sessionStartActionIDs) {
            return undefined;
        }
        return reportActions.reduce<string | undefined>((earliest, action) => {
            if (isCreatedAction(action) || sessionStartActionIDs.has(action.reportActionID) || action.actorAccountID !== currentUserAccountID) {
                return earliest;
            }
            return !earliest || action.created < earliest ? action.created : earliest;
        }, undefined);
    }, [showConciergeSidePanelWelcome, isConciergeSidePanel, hasUserSentMessage, sessionStartActionIDs, reportActions, currentUserAccountID]);

    const isCurrentSessionAction = useCallback(
        (action: OnyxTypes.ReportAction): boolean => {
            if (!firstUserMessageCreated) {
                return false;
            }
            return isCreatedAction(action) || (!sessionStartActionIDs?.has(action.reportActionID) && action.created >= firstUserMessageCreated);
        },
        [firstUserMessageCreated, sessionStartActionIDs],
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
