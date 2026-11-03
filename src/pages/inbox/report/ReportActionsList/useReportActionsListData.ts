import {getReportActionMessage, isNewerReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
import {isExpenseReport, isIOUReport, isInvoiceReport, isResolvedSupportTicket, isSupportTicket} from '@libs/ReportUtils';

import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';
import {useStreamedReply, useStreamedReplyActions} from '@pages/inbox/StreamedReplyContext';

import CONST from '@src/CONST';

import {useEffect} from 'react';

import type {UseReportActionsListDataParams} from './types';

/** Prepares the rendered report rows, including streamed replies, support surveys, and collapsed system messages. */
function useReportActionsListData({sortedVisibleReportActions, reportNameValuePairs, sessionStartTime, linkedReportActionID, unreadMarkerReportActionID}: UseReportActionsListDataParams) {
    const {report, sortedAllReportActions, parentReportAction, isConciergeHiddenHistory, showFullHistory} = useReportActionsListState();
    const {streamedReplyAction, isReplyPendingCompletion} = useStreamedReply();
    const {clearStreamedReply, revealStreamedReplyFromReportAction} = useStreamedReplyActions();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const persistedReplyAction = streamedReplyAction
        ? (sortedAllReportActions ?? sortedVisibleReportActions).find(
              (action) => action.reportActionID === streamedReplyAction.reportActionID && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
          )
        : undefined;

    const shouldHideSupportTicketSurvey = isSupportTicket(report) && (!isResolvedSupportTicket(report) || !!reportNameValuePairs?.reopenedAsReportID);
    const latestResolvedSupportTicketAction = sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
    const latestSupportTicketSurveyAction = latestResolvedSupportTicketAction
        ? sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && action.created >= latestResolvedSupportTicketAction.created)
        : undefined;

    const visibleReportActions = (() => {
        if (!streamedReplyAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && sessionStartTime && streamedReplyAction.created < sessionStartTime) {
            return sortedVisibleReportActions;
        }

        // A completed reveal belongs to the saved action, even when pagination keeps that action off screen.
        if (persistedReplyAction && !isReplyPendingCompletion) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic reply into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === streamedReplyAction.reportActionID) {
                // Completed local replies can retain their pending add flag after the server merges followups.
                if (!isReplyPendingCompletion) {
                    return sortedVisibleReportActions;
                }

                const visibleReportActionsWithReply = [...sortedVisibleReportActions];
                visibleReportActionsWithReply[index] = streamedReplyAction;
                return visibleReportActionsWithReply;
            }
            if (isNewerReportAction(streamedReplyAction, action)) {
                const visibleReportActionsWithReply = [...sortedVisibleReportActions];
                visibleReportActionsWithReply.splice(index, 0, streamedReplyAction);
                return visibleReportActionsWithReply;
            }
        }

        const visibleReportActionsWithReply = [...sortedVisibleReportActions];
        visibleReportActionsWithReply.push(streamedReplyAction);
        return visibleReportActionsWithReply;
    })();

    const shouldFilterSupportTicketSurveys =
        isSupportTicket(report) &&
        visibleReportActions.some(
            (action) =>
                action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY &&
                (shouldHideSupportTicketSurvey || action.reportActionID !== latestSupportTicketSurveyAction?.reportActionID),
        );
    const renderedVisibleReportActions = shouldFilterSupportTicketSurveys
        ? visibleReportActions.filter(
              (action) =>
                  action.actionName !== CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY ||
                  (!shouldHideSupportTicketSurvey && action.reportActionID === latestSupportTicketSurveyAction?.reportActionID),
          )
        : visibleReportActions;

    const shouldCollapseSystemMessages = isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report) || isTransactionThread(parentReportAction);
    const {
        displayReportActions,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
    } = useReportActionsPresentation({
        visibleReportActions: shouldCollapseSystemMessages ? renderedVisibleReportActions : [],
        linkedReportActionID,
        unreadMarkerReportActionID,
    });
    const listData = shouldCollapseSystemMessages ? displayReportActions : renderedVisibleReportActions;
    const canonicalIndexByReportActionID = new Map(renderedVisibleReportActions.map((action, index) => [action.reportActionID, index]));
    const unreadMarkerListIndex = shouldCollapseSystemMessages
        ? unreadMarkerReportActionIndex
        : renderedVisibleReportActions.findIndex((action) => action.reportActionID === unreadMarkerReportActionID);

    const streamedReplyHTML = streamedReplyAction ? getReportActionMessage(streamedReplyAction)?.html : undefined;
    const streamedReplyActionID = streamedReplyAction?.reportActionID;
    const isSyntheticReplyVisible = !!streamedReplyAction && renderedVisibleReportActions !== sortedVisibleReportActions;
    const streamedReplyAutoScrollKey = isSyntheticReplyVisible ? `${streamedReplyAction.reportActionID}:${streamedReplyHTML ?? ''}` : '';

    useEffect(() => {
        if (!streamedReplyAction || isSyntheticReplyVisible) {
            return;
        }

        clearStreamedReply();
    }, [clearStreamedReply, streamedReplyAction, isSyntheticReplyVisible]);

    useEffect(() => {
        if (!isReplyPendingCompletion || !streamedReplyAction || !persistedReplyAction) {
            return;
        }

        // The persisted action is the durable completion signal when a terminal Pusher event is missed.
        // Reconcile by action ID even when its HTML is byte-identical to the last streamed reply.
        revealStreamedReplyFromReportAction(persistedReplyAction);
    }, [streamedReplyAction, isReplyPendingCompletion, persistedReplyAction, revealStreamedReplyFromReportAction]);

    return {
        renderedVisibleReportActions,
        listData,
        canonicalIndexByReportActionID,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerListIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
        streamedReplyHTML,
        streamedReplyActionID,
        streamedReplyAutoScrollKey,
        isReplyPendingCompletion,
    };
}

export default useReportActionsListData;
