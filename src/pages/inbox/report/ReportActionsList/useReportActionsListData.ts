import {getReportActionMessage, isTransactionThread} from '@libs/ReportActionsUtils';
import {isExpenseReport, isIOUReport, isInvoiceReport} from '@libs/ReportUtils';

import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import CONST from '@src/CONST';

import {useEffect} from 'react';

import type {UseReportActionsListDataParams} from './types';

import getReportActionsWithStreamedReply from './getReportActionsWithStreamedReply';

/** Prepares the rendered report rows, including streamed Concierge drafts and collapsed system messages. */
function useReportActionsListData({sortedVisibleReportActions, sessionStartTime, linkedReportActionID, unreadMarkerReportActionID}: UseReportActionsListDataParams) {
    const {report, sortedAllReportActions, parentReportAction, isConciergeHiddenHistory, showFullHistory} = useReportActionsListState();
    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft, revealDraftFromReportAction} = useConciergeDraftActions();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const persistedDraftReportAction = draftReportAction
        ? (sortedAllReportActions ?? sortedVisibleReportActions).find(
              (action) => action.reportActionID === draftReportAction.reportActionID && action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
          )
        : undefined;

    const shouldHideDraft = !!(showHiddenHistory && sessionStartTime && draftReportAction && draftReportAction.created < sessionStartTime);
    const {reportActionsWithStreamedReply: renderedVisibleReportActions, isSyntheticDraftVisible} = getReportActionsWithStreamedReply({
        sortedVisibleReportActions,
        draftReportAction,
        isDraftPendingCompletion,
        hasPersistedDraft: !!persistedDraftReportAction,
        shouldHideDraft,
    });

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

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const draftAutoScrollKey = isSyntheticDraftVisible && draftReportAction ? `${draftReportAction.reportActionID}:${draftMessageHTML ?? ''}` : '';

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
        draftMessageHTML,
        draftReportActionID,
        draftAutoScrollKey,
        isDraftPendingCompletion,
    };
}

export default useReportActionsListData;
