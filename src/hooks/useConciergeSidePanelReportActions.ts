import {useCallback, useMemo, useState} from 'react';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const ONBOARDING_WINDOW_MS = 10 * 60 * 1000;

type UseConciergeSidePanelReportActionsParams = {
    report: OnyxTypes.Report;
    reportActions: OnyxTypes.ReportAction[];
    visibleReportActions: OnyxTypes.ReportAction[];
    isConciergeSidePanel: boolean;
    hasUserSentMessage: boolean;
    hasOlderActions: boolean;
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
    hasOlderActions,
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
    //
    // When no user message is found in the loaded set, we use the CREATED action's
    // timestamp to check if loaded Concierge messages are onboarding messages
    // (created within a short window). If the CREATED action hasn't loaded yet,
    // hasOlderActions tells us there's unloaded history — the user has likely
    // interacted before.
    const hadUserMessageAtSessionStart = useMemo(() => {
        if (!isConciergeSidePanel || !sessionStartActionIDs) {
            return false;
        }
        const hasUserMessageInLoadedSet = visibleReportActions.some(
            (action) => !isCreatedAction(action) && sessionStartActionIDs.has(action.reportActionID) && action.actorAccountID === currentUserAccountID,
        );
        if (hasUserMessageInLoadedSet) {
            return true;
        }
        const createdAction = visibleReportActions.find(isCreatedAction);
        if (!createdAction) {
            return hasOlderActions;
        }
        const createdActionTime = new Date(createdAction.created).getTime();
        const nonCreatedActions = visibleReportActions.filter((action) => !isCreatedAction(action) && sessionStartActionIDs.has(action.reportActionID));
        if (nonCreatedActions.length === 0) {
            return false;
        }
        const areAllOnboardingMessages = nonCreatedActions.every((action) => {
            if (action.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE) {
                return false;
            }
            const actionTime = new Date(action.created).getTime();
            return Math.abs(actionTime - createdActionTime) <= ONBOARDING_WINDOW_MS;
        });
        return !areAllOnboardingMessages;
    }, [isConciergeSidePanel, visibleReportActions, sessionStartActionIDs, currentUserAccountID, hasOlderActions]);

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
