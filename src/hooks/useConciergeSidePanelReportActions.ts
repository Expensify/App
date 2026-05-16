import {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import {buildConciergeGreetingReportAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
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
    const [pendingConciergeResponse] = useOnyx(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${report?.reportID}`);
    const hasPendingConciergeResponse = !!pendingConciergeResponse?.reportAction;

    const [showFullHistory, setShowFullHistoryState] = useState(false);
    const [prevSessionStartTime, setPrevSessionStartTime] = useState(sessionStartTime);
    const [prevHasUserSentMessage, setPrevHasUserSentMessage] = useState(hasUserSentMessage);

    const hasSessionChanged = sessionStartTime && prevSessionStartTime && prevSessionStartTime !== sessionStartTime;

    if (hasSessionChanged) {
        setPrevSessionStartTime(sessionStartTime);
        setShowFullHistoryState(false);
    } else if (prevHasUserSentMessage && !hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
        setShowFullHistoryState(false);
    } else if (prevHasUserSentMessage !== hasUserSentMessage) {
        setPrevHasUserSentMessage(hasUserSentMessage);
    }

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
        const earliestUserMsgCreated = visibleReportActions.reduce<string | undefined>((earliest, action) => {
            if (isCreatedAction(action) || action.actorAccountID !== currentUserAccountID || action.created <= sessionStartTime) {
                return earliest;
            }
            return !earliest || action.created < earliest ? action.created : earliest;
        }, undefined);
        return visibleReportActions.some((action) => {
            if (isCreatedAction(action) || action.actorAccountID === currentUserAccountID || action.created <= sessionStartTime) {
                return false;
            }
            if (earliestUserMsgCreated) {
                return action.created < earliestUserMsgCreated;
            }
            return true;
        });
    }, [isConciergeChat, visibleReportActions, sessionStartTime, currentUserAccountID]);

    const hasPreviousMessages = useMemo(() => {
        if (!isConciergeChat || !sessionStartTime || !hadUserMessageAtSessionStart) {
            return false;
        }
        const hasReadMessagesInLoadedSet = visibleReportActions.some((action) => !isCreatedAction(action) && action.created <= sessionStartTime);
        return hasReadMessagesInLoadedSet || hasOlderActions;
    }, [isConciergeChat, visibleReportActions, sessionStartTime, hadUserMessageAtSessionStart, hasOlderActions]);

    const isReportUnread = !!(report?.lastReadTime && report?.lastVisibleActionCreated && report.lastVisibleActionCreated > report.lastReadTime);

    const showConciergeWelcome =
        isConciergeChat &&
        hadUserMessageAtSessionStart &&
        !hasUnreadMessages &&
        (!isReportUnread || hasUserSentMessage) &&
        (!hasPendingConciergeResponse || hasUserSentMessage) &&
        !showFullHistory;

    const conciergeGreetingAction = useMemo(() => {
        if (!showConciergeWelcome) {
            return undefined;
        }
        return buildConciergeGreetingReportAction({reportID: report?.reportID, greetingText, created: report?.lastReadTime ?? DateUtils.getDBTime()});
    }, [showConciergeWelcome, report?.reportID, report?.lastReadTime, greetingText]);

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
                const postSessionActions = sessionStartTime ? actions.filter((action) => !isCreatedAction(action) && action.created > sessionStartTime) : [];

                if (postSessionActions.length === 0) {
                    return createdAction ? [conciergeGreetingAction, createdAction] : [conciergeGreetingAction];
                }

                const result = [...postSessionActions, conciergeGreetingAction];
                if (createdAction) {
                    result.push(createdAction);
                }
                return result;
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

            if (hasPendingConciergeResponse && !hasUserSentMessage) {
                const filtered = actions.filter(isUnreadAction);
                return filtered.length > 0 ? filtered : actions.filter(isCreatedAction);
            }

            if (hasUnreadMessages && !hasUserSentMessage) {
                return actions.filter(isUnreadAction);
            }

            const filterFn = hasUnreadMessages ? isUnreadAction : isCurrentSessionAction;
            const filtered = actions.filter(filterFn);
            if (filtered.length === 0) {
                return actions;
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
            hasPendingConciergeResponse,
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
        loadOlderChats(true);
    }, [loadOlderChats]);

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
