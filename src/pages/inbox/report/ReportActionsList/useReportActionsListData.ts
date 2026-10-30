/** Prepares chronological report rows, including streamed drafts, initial snapshots, and collapsed system messages. */
import useInitial from '@hooks/useInitial';

import {getReportActionMessage, isNewerReportAction, isTransactionThread} from '@libs/ReportActionsUtils';
import {isExpenseReport, isIOUReport, isInvoiceReport, isResolvedSupportTicket, isSupportTicket} from '@libs/ReportUtils';

import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import CONST from '@src/CONST';

import {useEffect, useState} from 'react';

import type {UseReportActionsListDataParams} from './types';

function useReportActionsListData({
    sortedVisibleReportActions,
    reportNameValuePairs,
    isOffline,
    sessionStartTime,
    linkedReportActionID,
    unreadMarkerReportActionID,
}: UseReportActionsListDataParams) {
    const {report, sortedAllReportActions, parentReportAction, isInitialReportLoadPending, isConciergeHiddenHistory, showFullHistory} = useReportActionsListState();
    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft, revealDraftFromReportAction} = useConciergeDraftActions();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const persistedDraftReportAction = draftReportAction
        ? (sortedAllReportActions ?? sortedVisibleReportActions).find(
              (action) => action.reportActionID === draftReportAction.reportActionID && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
          )
        : undefined;

    const shouldHideSupportTicketSurvey = isSupportTicket(report) && (!isResolvedSupportTicket(report) || !!reportNameValuePairs?.reopenedAsReportID);
    const latestResolvedSupportTicketAction = sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
    const latestSupportTicketSurveyAction = latestResolvedSupportTicketAction
        ? sortedAllReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && action.created >= latestResolvedSupportTicketAction.created)
        : undefined;

    const visibleReportActions = (() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && sessionStartTime && draftReportAction.created < sessionStartTime) {
            return sortedVisibleReportActions;
        }

        // A completed reveal belongs to the saved action, even when pagination keeps that action off screen.
        if (persistedDraftReportAction && !isDraftPendingCompletion) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                // Completed local replies can retain their pending add flag after the server merges followups.
                if (!isDraftPendingCompletion) {
                    return sortedVisibleReportActions;
                }

                const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
                visibleReportActionsWithDraft[index] = draftReportAction;
                return visibleReportActionsWithDraft;
            }
            if (isNewerReportAction(draftReportAction, action)) {
                const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
                visibleReportActionsWithDraft.splice(index, 0, draftReportAction);
                return visibleReportActionsWithDraft;
            }
        }

        const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
        visibleReportActionsWithDraft.push(draftReportAction);
        return visibleReportActionsWithDraft;
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

    // OpenReport starts with a tiny cached page before replacing it with the hydrated page. Keep that
    // already-visible page mounted until hydration finishes instead of exposing intermediate estimated
    // layouts. The hydrated list then mounts from scratch using the full dataset.
    const initialReportActionsSnapshot = useInitial(renderedVisibleReportActions.length > 0 ? renderedVisibleReportActions : undefined);
    const [hasReleasedInitialSnapshot, setHasReleasedInitialSnapshot] = useState(isOffline || !isInitialReportLoadPending || showFullHistory);
    if (!hasReleasedInitialSnapshot && (isOffline || !isInitialReportLoadPending || showFullHistory)) {
        setHasReleasedInitialSnapshot(true);
    }
    const shouldKeepInitialSnapshot = !hasReleasedInitialSnapshot;
    const reportActionsToRender = shouldKeepInitialSnapshot ? (initialReportActionsSnapshot ?? renderedVisibleReportActions) : renderedVisibleReportActions;

    // Report actions are stored newest-first. LegendList renders them chronologically.
    const chronologicalReportActions = [...reportActionsToRender].reverse();
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
        visibleReportActions: shouldCollapseSystemMessages ? chronologicalReportActions : [],
        linkedReportActionID,
        unreadMarkerReportActionID,
    });
    const listData = shouldCollapseSystemMessages ? displayReportActions : chronologicalReportActions;
    const canonicalIndexByReportActionID = new Map(reportActionsToRender.map((action, index) => [action.reportActionID, index]));

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const isSyntheticDraftVisible = !!draftReportAction && renderedVisibleReportActions !== sortedVisibleReportActions;

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    useEffect(() => {
        if (!isDraftPendingCompletion || !draftReportAction || !persistedDraftReportAction) {
            return;
        }

        // The persisted action is the durable completion signal when a terminal Pusher event is missed.
        // Reconcile by action ID even when its HTML is byte-identical to the last streamed draft.
        revealDraftFromReportAction(persistedDraftReportAction);
    }, [draftReportAction, isDraftPendingCompletion, persistedDraftReportAction, revealDraftFromReportAction]);

    const unreadMarkerListIndex = shouldCollapseSystemMessages ? unreadMarkerReportActionIndex : listData.findIndex((action) => action.reportActionID === unreadMarkerReportActionID);

    return {
        renderedVisibleReportActions,
        reportActionsToRender,
        listData,
        canonicalIndexByReportActionID,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerListIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
        draftMessageHTML,
        draftReportActionID,
        isDraftPendingCompletion,
    };
}

export default useReportActionsListData;
