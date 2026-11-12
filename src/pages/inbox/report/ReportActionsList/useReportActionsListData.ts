/** Prepares chronological report rows, including streamed drafts, initial snapshots, and collapsed system messages. */
import useInitial from '@hooks/useInitial';

import {getReportActionMessage, isTransactionThread} from '@libs/ReportActionsUtils';
import {isExpenseReport, isIOUReport, isInvoiceReport} from '@libs/ReportUtils';

import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import CONST from '@src/CONST';

import {useEffect, useState} from 'react';

import type {UseReportActionsListDataParams} from './types';

import getReportActionsWithStreamedReply from './getReportActionsWithStreamedReply';

function useReportActionsListData({sortedVisibleReportActions, isOffline, sessionStartTime, linkedReportActionID, unreadMarkerReportActionID}: UseReportActionsListDataParams) {
    const {report, sortedAllReportActions, parentReportAction, isInitialReportLoadPending, isConciergeHiddenHistory, showFullHistory} = useReportActionsListState();
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

    // OpenReport starts with a tiny cached page before replacing it with the hydrated page. Keep that
    // already-visible page mounted until hydration finishes instead of exposing intermediate estimated
    // layouts. The hydrated list then mounts from scratch using the full dataset.
    const initialReportActionsSnapshot = useInitial(renderedVisibleReportActions.length > 0 ? renderedVisibleReportActions : undefined);
    const [hasReleasedInitialSnapshot, setHasReleasedInitialSnapshot] = useState(isOffline || !isInitialReportLoadPending || showFullHistory);
    const shouldReleaseInitialSnapshot = !hasReleasedInitialSnapshot && (isOffline || !isInitialReportLoadPending || showFullHistory);
    if (shouldReleaseInitialSnapshot) {
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
