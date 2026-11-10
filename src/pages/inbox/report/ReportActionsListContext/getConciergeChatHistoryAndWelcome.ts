/** Apply Concierge history choices without changing how the main chat and side panel remember them. */
import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';

import type {ReportAction} from '@src/types/onyx';

type GetConciergeChatHistoryAndWelcomeParams = {
    reportID: string;
    reportActions: ReportAction[];
    visibleActions: ReportAction[];
    isMainChat: boolean;
    isSidePanel: boolean;
    isMainHistoryExpanded: boolean;
    isMainHistoryCollapsedByUser: boolean;
    hasFailedSend: boolean;
    hasUnreadMessageFromOthers: boolean;
    linkedActionID: string | undefined;
    showSidePanelHistory: boolean;
    hasUserSentMessage: boolean;
    hasOlderActions: boolean;
    sessionStartTime: string | null;
    sessionSentActionIDs: ReadonlySet<string>;
    currentUserAccountID: number;
    greetingText: string;
    greetingCreated: string;
};

function getConciergeMainChatWelcome({
    isMainChat,
    isMainHistoryExpanded,
    isMainHistoryCollapsedByUser,
    hasFailedSend,
    hasUnreadMessageFromOthers,
    linkedActionID,
}: Pick<
    GetConciergeChatHistoryAndWelcomeParams,
    'isMainChat' | 'isMainHistoryExpanded' | 'isMainHistoryCollapsedByUser' | 'hasFailedSend' | 'hasUnreadMessageFromOthers' | 'linkedActionID'
>) {
    const isMainChatHistoryExpanded = isMainChat && (isMainHistoryExpanded || !!linkedActionID);
    return {
        isMainChatHistoryExpanded,
        shouldShowMainChatWelcome: isMainChat && !isMainChatHistoryExpanded && (isMainHistoryCollapsedByUser || !hasFailedSend) && !hasUnreadMessageFromOthers,
    };
}

function getConciergeChatHistoryAndWelcome({
    reportID,
    reportActions,
    visibleActions,
    isMainChat,
    isSidePanel,
    isMainHistoryExpanded,
    isMainHistoryCollapsedByUser,
    hasFailedSend,
    hasUnreadMessageFromOthers,
    linkedActionID,
    showSidePanelHistory,
    hasUserSentMessage,
    hasOlderActions,
    sessionStartTime,
    sessionSentActionIDs,
    currentUserAccountID,
    greetingText,
    greetingCreated,
}: GetConciergeChatHistoryAndWelcomeParams) {
    // Main-chat history is shared with the composer and the rest of the report screen.
    const {isMainChatHistoryExpanded, shouldShowMainChatWelcome} = getConciergeMainChatWelcome({
        isMainChat,
        isMainHistoryExpanded,
        isMainHistoryCollapsedByUser,
        hasFailedSend,
        hasUnreadMessageFromOthers,
        linkedActionID,
    });

    // The side panel keeps pending messages visible if the server restamps them before the session boundary.
    const hadUserMessageAtSessionStart =
        isSidePanel &&
        !!sessionStartTime &&
        (hasOlderActions || visibleActions.some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created < sessionStartTime));
    const hasPreviousMessages =
        isSidePanel &&
        hadUserMessageAtSessionStart &&
        !!sessionStartTime &&
        (hasOlderActions || visibleActions.some((action) => !isCreatedAction(action) && action.created < sessionStartTime));
    const hasSentInSession = hasUserSentMessage || sessionSentActionIDs.size > 0;
    const shouldShowSidePanelWelcome = isSidePanel && hadUserMessageAtSessionStart && !hasSentInSession && !showSidePanelHistory;
    const shouldShowGreeting = isSidePanel && hadUserMessageAtSessionStart && !showSidePanelHistory;
    const greeting = shouldShowGreeting ? buildConciergeGreetingReportAction({reportID, greetingText, created: greetingCreated}) : undefined;
    const firstUserMessageCreated =
        shouldShowSidePanelWelcome || !isSidePanel || !hasUserSentMessage || !sessionStartTime
            ? undefined
            : reportActions.reduce<string | undefined>((earliest, action) => {
                  if (
                      isCreatedAction(action) ||
                      action.actorAccountID !== currentUserAccountID ||
                      (!isCurrentUserPendingAddAction(action, currentUserAccountID) && action.created < sessionStartTime)
                  ) {
                      return earliest;
                  }
                  return !earliest || action.created < earliest ? action.created : earliest;
              }, undefined);

    const filterHistory = (actions: ReportAction[]): ReportAction[] => {
        if (shouldShowSidePanelWelcome && greeting) {
            const created = actions.find(isCreatedAction);
            return created ? [greeting, created] : [greeting];
        }
        if (!isSidePanel || showSidePanelHistory) {
            return actions;
        }
        if (!sessionStartTime) {
            return actions.filter(isCreatedAction);
        }
        if (!hadUserMessageAtSessionStart) {
            return actions;
        }
        const filtered = actions.filter((action) => {
            if (sessionSentActionIDs.has(action.reportActionID)) {
                return true;
            }
            if (!firstUserMessageCreated) {
                return false;
            }
            return (
                isCreatedAction(action) ||
                isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                (action.created >= sessionStartTime && (action.actorAccountID !== currentUserAccountID || action.created >= firstUserMessageCreated))
            );
        });
        if (filtered.length === 0) {
            if (!greeting) {
                return actions;
            }
            const created = actions.find(isCreatedAction);
            return created ? [greeting, created] : [greeting];
        }
        if (greeting) {
            const createdIndex = filtered.findIndex(isCreatedAction);
            filtered.splice(createdIndex < 0 ? filtered.length : createdIndex, 0, greeting);
        }
        return filtered;
    };

    return {
        conversationActions: filterHistory(reportActions),
        visibleConversationActions: filterHistory(visibleActions),
        shouldShowMainChatWelcome,
        isMainChatHistoryExpanded,
        shouldShowSidePanelWelcome,
        hasPreviousMessages,
    };
}

export default getConciergeChatHistoryAndWelcome;
export {getConciergeMainChatWelcome};
